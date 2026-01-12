const songService = require("../service/songService");
const slugify = require("slugify");

const getSongsByQuery = async (req, res) => {
  const { query, limit = 1 } = req.query;

  const parsedLimit = parseInt(limit);
  const parsedQuery = slugify(query, { lower: true, strict: true, trim: true });

  if (!parsedQuery) {
    return res.status(400).json({ error: "query parameter is required" });
  }

  if (isNaN(parsedLimit) || parsedLimit <= 0) {
    return res
      .status(400)
      .json({ error: "limit parameter must be a positive integer" });
  }

  try {
    const songs = await songService.getSongsByQuery(parsedQuery, parsedLimit);
    res.status(200).json(songs);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: e });
  }
};
module.exports = {
  getSongsByQuery,
};
