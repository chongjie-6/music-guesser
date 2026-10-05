-- Read-only login for the game server; set its password out of band with ALTER ROLE
CREATE ROLE game_reader LOGIN;
GRANT SELECT ON songs, artists TO game_reader;
