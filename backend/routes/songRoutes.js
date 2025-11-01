const router = require("express").Router();

// Controllers
const songController = require("../controller/songController")

router.get("/songs", songController.getSongByQuery);

module.exports = router;
