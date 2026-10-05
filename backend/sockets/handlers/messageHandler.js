const { submitGuess } = require("../../service/gameService");
const { isInRoom } = require("../../service/roomService");
const { continueGame } = require("./gameHandler");

const MAX_MESSAGE_LENGTH = 200;
const MIN_MESSAGE_INTERVAL_MS = 300;

module.exports = (io, socket) => {
  /**
   * Event: send-message
   */
  socket.on("send-message", (payload) => {
    const { roomId, message } = payload || {};
    if (!isInRoom(socket, roomId)) return;

    const cleanMessage = String(message ?? "")
      .trim()
      .slice(0, MAX_MESSAGE_LENGTH);
    if (cleanMessage === "") return;

    const now = Date.now();
    if (now - (socket.lastMessageAt ?? 0) < MIN_MESSAGE_INTERVAL_MS) return;
    socket.lastMessageAt = now;

    const senderName = socket.user?.name || "Anonymous";
    io.in(roomId).emit("newMessage", {
      message: cleanMessage,
      senderId: socket.id,
      senderName,
    });

    const result = submitGuess({
      roomId,
      userId: socket.id,
      userName: senderName,
      guess: cleanMessage,
    });
    if (!result) return;

    io.in(roomId).emit("game-correct-guess", {
      winner: result.winner,
      answer: result.answer,
    });
    continueGame(io, roomId, result);
  });
};
