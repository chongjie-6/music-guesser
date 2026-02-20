const songService = require("../service/songService");

const normalizeQuery = (query = "") =>
  String(query)
    .trim()
    .replace(/\s+/g, " ");

const getAlbumsByQuery = async (req, res) => {
  const { query, limit = 3, songsPerAlbum = 5 } = req.query;

  const parsedLimit = parseInt(limit, 10);
  const parsedSongsPerAlbum = parseInt(songsPerAlbum, 10);
  const parsedQuery = normalizeQuery(query);

  if (!parsedQuery) {
    return res.status(400).json({ error: "query parameter is required" });
  }

  if (isNaN(parsedLimit) || parsedLimit <= 0) {
    return res
      .status(400)
      .json({ error: "limit parameter must be a positive integer" });
  }

  if (isNaN(parsedSongsPerAlbum) || parsedSongsPerAlbum <= 0) {
    return res
      .status(400)
      .json({ error: "songsPerAlbum parameter must be a positive integer" });
  }

  try {
    const albums = await songService.getAlbumsWithSongsByQuery(
      parsedQuery,
      parsedLimit,
      parsedSongsPerAlbum
    );
    res.status(200).json(albums);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Failed to fetch albums" });
  }
};

module.exports = {
  getAlbumsByQuery,
};
