const router = require("express").Router();

// Controllers
const songController = require("../controller/songController");

router.get("/song", songController.getSongByQuery);
router.get("/songs", songController.getSongsByQuery);
module.exports = router;
