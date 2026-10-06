const { guessVerdict, hasSolved } = require("../../service/gameService");
const { playerFor } = require("../../service/roomService");
const { solve } = require("./gameHandler");

const MAX_MESSAGE_LENGTH = 200;
const MIN_MESSAGE_INTERVAL_MS = 300;

module.exports = (io, socket) => {
  /**
   * Event: send-message
   */
  socket.on("send-message", (payload) => {
    const { roomId, message } = payload || {};
    const found = playerFor(socket, roomId);
    if (!found) return;

    const cleanMessage = String(message ?? "")
      .trim()
      .slice(0, MAX_MESSAGE_LENGTH);
    if (cleanMessage === "") return;

    const now = Date.now();
    if (now - (socket.lastMessageAt ?? 0) < MIN_MESSAGE_INTERVAL_MS) return;
    socket.lastMessageAt = now;

    const { room, player } = found;
    const chat = { message: cleanMessage, senderId: player.id, senderName: player.name };

    // Players who know the answer can only talk to each other until the round ends
    if (hasSolved(room, player.id)) {
      for (const p of room.players.values()) {
        if (hasSolved(room, p.id)) io.to(p.socketId).emit("newMessage", { ...chat, type: "solved" });
      }
      return;
    }

    const verdict = guessVerdict(room, cleanMessage);
    if (verdict === "correct" && !player.spectator) {
      solve(io, room, player);
      return;
    }
    // Anything near the answer is only shown to its sender, so nobody can copy it
    if (verdict) {
      const close = verdict === "close" && !player.spectator;
      socket.emit("newMessage", close ? { ...chat, type: "close" } : chat);
      return;
    }
    io.in(roomId).emit("newMessage", chat);
  });
};
