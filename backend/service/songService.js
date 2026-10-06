const pool = require("../config/db");

const ERAS = {
  classic: [1900, 2000],
  "2000s": [2000, 2010],
  "2010s": [2010, 2020],
  "2020s": [2020, 2030],
};
const MIN_GENRE_SONGS = 20;

/**
 * Songs matching the filters in random order; a seed gives everyone the same order.
 */
const getSongs = async ({ count, genre = null, era = "any", excludeIds = [], seed = null }) => {
  const [from, to] = ERAS[era] ?? [null, null];
  const { rows } = await pool.query(
    `SELECT s.song_id, s.song_name, s.song_preview_url, s.song_artwork_url_100,
            s.genre_name, s.released_on, a.artist_name, a.artist_view_url
     FROM songs s
     LEFT JOIN artists a ON a.artist_id = s.artist_id
     WHERE ($1::text IS NULL OR s.genre_name = $1)
       AND ($2::int IS NULL OR (s.released_on >= make_date($2, 1, 1) AND s.released_on < make_date($3, 1, 1)))
       AND NOT (s.song_id = ANY($4::bigint[]))
     ORDER BY md5(s.song_id::text || coalesce($5, random()::text))
     LIMIT $6`,
    [genre, from, to, excludeIds, seed, count],
  );
  return rows;
};

let genres = null;

const loadGenres = async () => {
  genres ??= (
    await pool.query(
      `SELECT genre_name FROM songs GROUP BY genre_name
       HAVING count(*) >= $1 ORDER BY count(*) DESC`,
      [MIN_GENRE_SONGS],
    )
  ).rows.map((row) => row.genre_name);
  return genres;
};

const currentGenres = () => genres ?? [];

module.exports = { ERAS, getSongs, loadGenres, currentGenres };
