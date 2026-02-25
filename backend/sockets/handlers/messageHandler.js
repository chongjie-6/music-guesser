const { submitGuess, getRoomGame } = require("../../service/gameService");
const {
  clearRoomTimer,
  startRoundTimer,
} = require("./gameHandler");

module.exports = (io, socket) => {
  /**
   * Event: receive-message
   */
  socket.on("send-message", async ({ roomId, message }) => {
    const cleanMessage = String(message || "").trim();
    if (cleanMessage === "") return;

    const messageData = {
      message: cleanMessage,
      senderId: socket.id,
      senderName: socket.user?.name || "Anonymous",
    };

    console.log("Emitting Message to room:", roomId, messageData);
    io.in(roomId).emit("newMessage", messageData);

    if (getRoomGame(roomId)?.isActive) {
      try {
        const result = await submitGuess({
          roomId,
          userId: socket.id,
          userName: socket.user?.name,
          guess: cleanMessage,
        });

        if (result.status === "correct") {
          clearRoomTimer(roomId);

          io.in(roomId).emit("game-correct-guess", {
            winner: result.winner,
            answer: result.answer,
            scores: result.nextRound.scores,
          });
          io.in(roomId).emit("game-next-round", result.nextRound);

          startRoundTimer(io, roomId);
        }
      } catch (error) {
        console.log("guess submission error", error);
        socket.emit("error", "Could not validate guess");
      }
    }

    console.log(`Message received: ${cleanMessage} from socket ${socket.id}`);
  });
};