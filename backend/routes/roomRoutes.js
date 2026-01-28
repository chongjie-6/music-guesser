const router = require("express").Router();
const limiter = require("../middleware/rateLimiter");

const roomController = require("../controller/roomController");

router.post("/joinRoom", roomController.joinRoom);

module.exports = router;
