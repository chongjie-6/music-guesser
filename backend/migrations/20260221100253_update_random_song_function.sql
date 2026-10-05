create or replace function get_random_song()
returns setof songs
language sql
as $$
   select s.* from songs s
   LEFT JOIN artists a ON a.artist_id = s.artist_id
   order by random()
   limit 1;
$$