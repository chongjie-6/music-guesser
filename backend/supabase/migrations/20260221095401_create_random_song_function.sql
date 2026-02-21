create or replace function get_random_song()
returns setof songs
language sql
as $$
   select * from songs 
   order by random()
   limit 1;
$$;