const {
  checkRoomExists,
  checkMaxPlayersReached,
} = require("../../service/roomService");

module.exports = (io, socket) => {
  /**
   * Event: start-game
   */
  socket.on("start-game", (roomID) => {
    socket.to(roomID).emit("message", "Game has started!");
    console.log(`Game started by: ${socket.id}`);
  });
};
