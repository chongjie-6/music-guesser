const { checkRoomExists } = require("../../service/roomService");
const {
  startRoomGame,
  getRoomGame,
  skipRound,
} = require("../../service/gameService");

const roomTimers = new Map();

const ROUND_TIMEOUT_MS = 5000;

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
 * skips the round without awarding any points and emits "skipped-round".
 */
const startRoundTimer = (io, roomId) => {
  clearRoomTimer(roomId);

  const timer = setTimeout(async () => {
    try {
      const result = await skipRound(roomId);
      if (!result) return;

      io.in(roomId).emit("skipped-round", {
        ...result.nextRound,
        answer: result.answer,
      });

      console.log(`Round skipped in room ${roomId}. Answer was: ${result.answer}`);

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

      startRoundTimer(io, roomID);
    } catch (error) {
      console.log("start-game error", error);
      socket.emit("error", "Unable to start game right now");
    }
  });

  /**
   * Expose helpers so messageHandler can clear/restart the timer on correct guess.
   */
  socket.clearRoomTimer = clearRoomTimer;
  socket.startRoundTimer = startRoundTimer;
};

module.exports.clearRoomTimer = clearRoomTimer;
module.exports.startRoundTimer = startRoundTimer;