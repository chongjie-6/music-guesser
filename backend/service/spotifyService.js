const supabase = require("../config/db");

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

const getRandomSong = async () => {
  const supabaseClient = supabase;

  const { data: song_response, error } =
    await supabaseClient.rpc("get_random_song");

  if (!song_response || song_response.length <= 0 || error) {
    throw new Error(`Failed to get random song ${error}`);
  }

  const song_data = await song_response;

  console.log(song_data[0]);
  return song_data[0];
};

module.exports = { createClient, getSongFromSpotifyWithQuery, getRandomSong };
