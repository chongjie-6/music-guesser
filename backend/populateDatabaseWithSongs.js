require("dotenv").config();
const { setTimeout } = require("node:timers/promises");
const { Pool } = require("pg");

// Writes need the owner role: the game server's role is read-only
const pool = new Pool({ connectionString: process.env.DATABASE_OWNER_URL });

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

      await pool.query(
        `INSERT INTO artists (artist_id, artist_name, artist_view_url)
         VALUES ($1, $2, $3)
         ON CONFLICT (artist_id) DO UPDATE SET
           artist_name = EXCLUDED.artist_name,
           artist_view_url = EXCLUDED.artist_view_url`,
        [artistId, artistName, artistViewUrl],
      );

      await pool.query(
        `INSERT INTO songs (song_id, song_name, song_preview_url, song_artwork_url_30,
           song_artwork_url_60, song_artwork_url_100, artist_id, genre_name, released_on)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (song_id) DO UPDATE SET
           song_name = EXCLUDED.song_name,
           song_preview_url = EXCLUDED.song_preview_url,
           song_artwork_url_30 = EXCLUDED.song_artwork_url_30,
           song_artwork_url_60 = EXCLUDED.song_artwork_url_60,
           song_artwork_url_100 = EXCLUDED.song_artwork_url_100,
           artist_id = EXCLUDED.artist_id,
           genre_name = EXCLUDED.genre_name,
           released_on = EXCLUDED.released_on`,
        [
          trackId,
          trackName,
          previewUrl,
          artworkUrl30,
          artworkUrl60,
          artworkUrl100,
          artistId,
          primaryGenreName,
          releaseDate,
        ],
      );

      console.log(`Inserted ${trackName} by ${artistName}`);
    } catch (e) {
      console.log(e);
      console.error(`Failed to insert "${song}":`, e.message);
    }

    await setTimeout(10000);
  }

  console.log("Done inserting all songs.");
  await pool.end();
};

populateDatabaseWithSongs();
