require("dotenv").config();
const MAX_LIMIT = 10;
const MAX_OFFSET = 2;
const createClient = async () => {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Spotify token request failed: ${errText}`);
  }

  const data = await response.json();

  return data.access_token;
};

const getSongFromSpotifyWithQuery = async (query) => {
  const token = await createClient();

  const random_offset = Math.floor(Math.random() * MAX_OFFSET);

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${query}&type=track&limit=${MAX_LIMIT}&offset=${random_offset}&market=US`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  const tracksJSON = await response.json();
  const tracks = tracksJSON.tracks.items;

  if (!tracks.length) throw new Error("No tracks found on selected page");
  return tracks;
};

const getRandomSong = async (query, counter) => {
  const tracks = await getSongFromSpotifyWithQuery(query);
  const picked = tracks[Math.floor(Math.random() * tracks.length)];

  const song_name = picked?.name ?? "";
  const artist = (picked?.artists ?? []).map((a) => a.name).join(" ") || "";

  if (!song_name) throw new Error("Picked track missing name");

  const itunesTerm = encodeURIComponent(`${song_name} ${artist}`.trim());
  const song_response = await fetch(
    `https://itunes.apple.com/search?term=${itunesTerm}&entity=song&limit=20&country=US`,
  );

  if (!song_response.ok) {
    const text = await song_response.text();
    throw new Error(`iTunes search failed (${song_response.status}): ${text}`);
  }

  const song_data = await song_response.json();
  const results = song_data?.results ?? [];

  if (!results.length) {
    throw new Error("Could not find iTunes matches for this track");
  }
  const best = results.find((r) => r.previewUrl) ?? results[0];

  return best;
};

module.exports = { createClient, getSongFromSpotifyWithQuery, getRandomSong };
