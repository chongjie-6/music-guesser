const { checkRoomExists } = require("../../service/roomService");
const {
  startRoomGame,
  getRoomGame,
  skipRound,
} = require("../../service/gameService");

// Track active timers per room so they can be cleared on correct guess
const roomTimers = new Map();

const ROUND_TIMEOUT_MS = 20000;

/**
 * Clears any existing skip timer for a room.
 */
const clearRoomTimer = (roomId) => {
  const existing = roomTimers.get(roomId);
  if (existing) {
    clearTimeout(existing);
    roomTimers.delete(roomId);
  }
};

/**
 * Starts a 5-second timer for a room. If nobody guesses in time,
 * skips the round without awarding any points and emits "skipped-round"
 * or "game-end" if the game is over.
 */
const startRoundTimer = (io, roomId) => {
  clearRoomTimer(roomId);

  const timer = setTimeout(async () => {
    try {
      const result = await skipRound(roomId);
      if (!result) return;

      if (result.gameOver) {
        clearRoomTimer(roomId);
        io.in(roomId).emit("skipped-round", { answer: result.answer, scores: result.result.scores });
        io.in(roomId).emit("game-end", result.result);
        console.log(`Game over in room ${roomId} after skip. Winner: ${result.result.winner}`);
        return;
      }

      io.in(roomId).emit("skipped-round", {
        ...result.nextRound,
        answer: result.answer,
      });

      console.log(`Round skipped in room ${roomId}. Answer was: ${result.answer}`);

      // Start timer for next round
      startRoundTimer(io, roomId);
    } catch (error) {
      console.log("skip-round error", error);
    }
  }, ROUND_TIMEOUT_MS);

  roomTimers.set(roomId, timer);
};

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

      // Start the skip timer for the first round
      startRoundTimer(io, roomID);
    } catch (error) {
      console.log("start-game error", error);
      socket.emit("error", "Unable to start game right now");
    }
  });
};

module.exports.clearRoomTimer = clearRoomTimer;
module.exports.startRoundTimer = startRoundTimer;