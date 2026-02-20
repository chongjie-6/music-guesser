const router = require("express").Router();
const limiter = require("../middleware/rateLimiter");

// Controllers
const songController = require("../controller/songController");

router.get("/albums", limiter, songController.getAlbumsByQuery);
router.get("/songs", limiter, songController.getAlbumsByQuery);

module.exports = router;
