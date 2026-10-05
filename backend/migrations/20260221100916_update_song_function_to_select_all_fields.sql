DROP FUNCTION IF EXISTS get_random_song();

CREATE TYPE random_song_result AS (
  song_name text,
  song_preview_url text,
  song_artwork_url_30 text,
  song_artwork_url_60 text,
  song_artwork_url_100 text,
  genre_name text,
  artist_name text,
  artist_view_url text
);

CREATE OR REPLACE FUNCTION get_random_song()
RETURNS SETOF random_song_result
LANGUAGE sql AS $$
  SELECT
    s.song_name,
    s.song_preview_url,
    s.song_artwork_url_30,
    s.song_artwork_url_60,
    s.song_artwork_url_100,
    s.genre_name,
    a.artist_name,
    a.artist_view_url
  FROM songs s
  LEFT JOIN artists a ON a.artist_id = s.artist_id
  ORDER BY random()
  LIMIT 1;
$$;