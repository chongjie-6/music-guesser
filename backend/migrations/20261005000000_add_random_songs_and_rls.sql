CREATE OR REPLACE FUNCTION get_random_songs(song_count int)
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
    a.artist_view_url,
    s.released_on
  FROM songs s
  LEFT JOIN artists a ON a.artist_id = s.artist_id
  ORDER BY random()
  LIMIT song_count;
$$;

ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read" ON songs;
CREATE POLICY "Public read" ON songs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read" ON artists;
CREATE POLICY "Public read" ON artists FOR SELECT USING (true);
