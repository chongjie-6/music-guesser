const { checkRoomExists } = require("../../service/roomService");
const { startRoomGame, getRoomGame } = require("../../service/gameService");

module.exports = (io, socket) => {
  /**
   * Event: start-game
   */
  socket.on("start-game", async (roomID) => {
    if (!roomID || roomID.trim() === "") {
      socket.emit("error", "Invalid room ID");
      return;
    }

    if (!checkRoomExists(roomID, io)) {
      socket.emit("error", "Room does not exist");
      return;
    }

    if (getRoomGame(roomID)?.isActive) {
      socket.emit("error", "Game is already active");
      return;
    }

    try {
      const roundData = await startRoomGame(roomID);
      io.in(roomID).emit("game-started", roundData);
      io.in(roomID).emit("message", "Game started! Guess the song title.");
      console.log(`Game started by: ${socket.id}`);
    } catch (error) {
      console.log("start-game error", error);
      socket.emit("error", "Unable to start game right now");
    }
  });
};
