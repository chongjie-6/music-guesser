const router = require("express").Router();
const limiter = require("../middleware/rateLimiter");

// Controllers
const songController = require("../controller/songController");

router.get("/songs", songController.getSongsByQuery);

module.exports = router;
