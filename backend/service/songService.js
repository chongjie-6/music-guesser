const supabase = require("../config/db");

const getRandomSongs = async (count) => {
  const { data, error } = await supabase.rpc("get_random_songs", {
    song_count: count,
  });

  if (error || !data?.length) {
    throw new Error(`Failed to get random songs: ${error?.message}`);
  }

  return data;
};

module.exports = { getRandomSongs };
