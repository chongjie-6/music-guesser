/**
 *
 * @param query  Query to search for song (Itunes)
 * @returns A song object from Itunes API
 */
const getSongByQuery = async (query) => {
  const response = await fetch(
    `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`
  );
  const data = await response.json();
  return data.results[0];
};

/**
 *
 * @param query  Query to get 200 songs (Itunes)
 * @returns 200 song objects from Itunes API
 */
const getSongsByQuery = async (query) => {
  const response = await fetch(
    `https://itunes.apple.com/search?term=${query}&entity=song&limit=200`
  );
  const data = await response.json();
  return data.results;
};

module.exports = {
  getSongByQuery,
  getSongsByQuery,
};
