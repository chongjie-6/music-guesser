const songService = require("../service/songServices");

const getSongByQuery = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "query parameter is required" });
  }

  try {
    const song = await songService.getSongByQuery(query);
    res.status(200).json(song);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: e });
  }
};

module.exports = {
  getSongByQuery,
};
