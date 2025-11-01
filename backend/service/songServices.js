/**
 *
 * @param query  Query to search for song (Itunes)
 * @returns A URL string of the song preview
 */
const getSongByQuery = async (query) => {
  const response = await fetch(
    `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`
  );
  const data = await response.json();
  return data.results[0];
};

module.exports = {
  getSongByQuery,
};
