const io = require("../server");
const createRoom = (req, res) => {
  const { roomID, maxPlayers } = req.body;
  
  io.join(roomID);

};

module.exports = {
  createRoom,
};
