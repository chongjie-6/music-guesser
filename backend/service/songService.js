/**
 * @param limit Number of songs to return
 * @param query  Query to get songs from Itunes
 * @returns Array of song objects from Itunes API
 */
const getSongsByQuery = async (query, limit) => {
  const response = await fetch(
    `https://itunes.apple.com/search?term=${query}&entity=song&limit=${limit}`
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch songs from Itunes API");
  }

  return data.results;
};

module.exports = {
  getSongsByQuery,
};
