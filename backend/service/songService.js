const pool = require("../config/db");

const getRandomSongs = async (count) => {
  const { rows } = await pool.query("SELECT * FROM get_random_songs($1)", [count]);

  if (!rows.length) {
    throw new Error("Failed to get random songs: no songs in the database");
  }

  return rows;
};

module.exports = { getRandomSongs };
