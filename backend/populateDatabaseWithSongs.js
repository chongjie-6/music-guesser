require("dotenv").config();
const { setTimeout } = require("node:timers/promises");
const { createClient } = require("@supabase/supabase-js");

// Writes need the secret key: RLS only allows public reads
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

const songList = require("./data/data").anotherListOfTopSongs;

const getSong = async (song) => {
  const itunesTerm = encodeURIComponent(`${song}`.trim());
  const song_response = await fetch(
    `https://itunes.apple.com/search?term=${itunesTerm}&entity=song&limit=20&country=US`,
  );

  if (!song_response.ok) {
    console.log(song_response);
    const text = await song_response.text();
    throw new Error(`iTunes search failed (${song_response.status}): ${text}`);
  }

  const song_data = await song_response.json();
  const results = song_data?.results ?? [];
  if (!results.length)
    throw new Error("Could not find iTunes matches for this track");

  return results.find((r) => r.previewUrl) ?? results[0];
};

const populateDatabaseWithSongs = async () => {
  for (const songEntry of songList) {
    const song = songEntry.replace(
      /[\(\[（［][^)\]）］]*[\)\]）］]|[^\w\s]/g,
      "",
    );
    try {
      const {
        trackId,
        trackName,
        previewUrl,
        artworkUrl30,
        artworkUrl60,
        artworkUrl100,
        artistId,
        artistName,
        artistViewUrl,
        primaryGenreName,
        releaseDate,
      } = await getSong(song);

      const songInfo = {
        song_id: trackId,
        song_name: trackName,
        song_preview_url: previewUrl,
        song_artwork_url_30: artworkUrl30,
        song_artwork_url_60: artworkUrl60,
        song_artwork_url_100: artworkUrl100,
        artist_id: artistId,
        genre_name: primaryGenreName,
        released_on: releaseDate,
      };

      const artistInfo = {
        artist_id: artistId,
        artist_name: artistName,
        artist_view_url: artistViewUrl,
      };

      const { error: artistError } = await supabase
        .from("artists")
        .upsert(artistInfo);
      if (artistError) throw artistError;

      const { error: songError } = await supabase.from("songs").upsert(songInfo);
      if (songError) throw songError;

      console.log(`Inserted ${trackName} by ${artistName}`);
    } catch (e) {
      console.log(e);
      console.error(`Failed to insert "${song}":`, e.message);
    }

    await setTimeout(10000);
  }

  console.log("Done inserting all songs.");
};

populateDatabaseWithSongs();
