const { submitGuess, getRoomGame } = require("../../service/gameService");
const { clearRoomTimer, startRoundTimer } = require("./gameHandler");

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
          // Stop the skip timer — someone guessed in time
          clearRoomTimer(roomId);

          io.in(roomId).emit("game-correct-guess", {
            winner: result.winner,
            answer: result.answer,
            scores: result.gameOver ? result.result.scores : result.nextRound.scores,
          });

          if (result.gameOver) {
            io.in(roomId).emit("game-end", result.result);
            console.log(`Game over in room ${roomId}. Winner: ${result.result.winner}`);
          } else {
            io.in(roomId).emit("game-next-round", result.nextRound);
            // Start fresh timer for next round
            startRoundTimer(io, roomId);
          }
        }
      } catch (error) {
        console.log("guess submission error", error);
        socket.emit("error", "Could not validate guess");
      }
    }

    console.log(`Message received: ${cleanMessage} from socket ${socket.id}`);
  });
};