-- Add Artist Schema
CREATE TABLE IF NOT EXISTS artists(
    artist_id bigint primary key,
    artist_name text not null,
    artist_view_url text
); 

-- Add Songs Table
CREATE TABLE IF NOT EXISTS songs(
    song_id bigint primary key,
    song_name text not null,
    song_preview_url text not null,
    song_artwork_url_30 text,
    song_artwork_url_60 text,
    song_artwork_url_100 text,
    artist_id bigint references artists(artist_id) ON DELETE CASCADE,
    genre_name text 
);