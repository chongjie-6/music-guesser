const supabase = require("../config/db");

require("dotenv").config();

const getRandomSong = async () => {
  const supabaseClient = supabase;

  const { data: song_response, error } =
    await supabaseClient.rpc("get_random_song");

  if (!song_response || song_response.length <= 0 || error) {
    throw new Error(`Failed to get random song ${error}`);
  }

  const song_data = await song_response;

  console.log(song_data[0]);
  return song_data[0];
};

module.exports = { getRandomSong };
