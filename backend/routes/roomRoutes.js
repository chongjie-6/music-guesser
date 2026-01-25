const router = require("express").Router();
const limiter = require("../middleware/rateLimiter");

const roomController = require("../controller/roomController");

router.post("/createRoom", limiter, roomController.createRoom);

module.exports = router;
