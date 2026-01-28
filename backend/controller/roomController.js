const io = require("../server").io;
const { checkRoomExists } = require("../service/roomService");

const joinRoom = (req, res) => {
  const { roomID } = req.body;

  try {
    if (!roomID) return res.status(400).json({ error: "Room ID is required" });

    const exists = checkRoomExists(roomID);
    if (exists) return res.status(400).json({ error: "Room already exists" });

    io.sockets.on("join", (socket) => {
      socket.join(roomID);
    });

    return res
      .status(200)
      .json({ message: "Room joined successfully", roomID });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ e });
  }
};

module.exports = {
  joinRoom,
};
