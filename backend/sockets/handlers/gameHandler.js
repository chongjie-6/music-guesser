const { isInRoom } = require("../../service/roomService");
const {
  isGameRunning,
  startRoomGame,
  skipRound,
} = require("../../service/gameService");

// Track active timers per room so they can be cleared on correct guess
const roomTimers = new Map();

const MUSIC_MS = 15000;
const SILENT_GUESS_MS = 5000;

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
 * Emits the next round and restarts the skip timer, or ends the game.
 */
const continueGame = (io, roomId, result) => {
  if (result.gameOver) {
    clearRoomTimer(roomId);
    io.in(roomId).emit("game-end", result.result);
    console.log(`Game over in room ${roomId}. Winner: ${result.result.winner}`);
    return;
  }

  io.in(roomId).emit("game-next-round", {
    ...result.nextRound,
    timeLeftMs: MUSIC_MS,
  });
  startRoundTimer(io, roomId);
};

/**
 * Plays the music for a while, then stops it and gives players a little longer
 * to guess. If nobody does, skips the round without awarding any points.
 */
const startRoundTimer = (io, roomId) => {
  clearRoomTimer(roomId);
  const skip = () => {
    roomTimers.delete(roomId);
    const result = skipRound(roomId);
    if (!result) return;

    io.in(roomId).emit("skipped-round", { answer: result.answer });
    console.log(`Round skipped in room ${roomId}. Answer was: ${result.answer}`);
    continueGame(io, roomId, result);
  };
  const stopMusic = () => {
    io.in(roomId).emit("game-music-stop", { timeLeftMs: SILENT_GUESS_MS });
    roomTimers.set(roomId, setTimeout(skip, SILENT_GUESS_MS));
  };

  roomTimers.set(roomId, setTimeout(stopMusic, MUSIC_MS));
};

module.exports = (io, socket) => {
  /**
   * Event: start-game
   */
  socket.on("start-game", async (roomID) => {
    if (!isInRoom(socket, roomID)) {
      socket.emit("error", "You are not in this room");
      return;
    }

    if (isGameRunning(roomID)) {
      socket.emit("error", "Game is already active");
      return;
    }

    try {
      const roundData = await startRoomGame(roomID);
      if (!roundData) return;

      io.in(roomID).emit("game-started", {
        ...roundData,
        timeLeftMs: MUSIC_MS,
      });
      console.log(`Game started by: ${socket.id}`);
      startRoundTimer(io, roomID);
    } catch (error) {
      console.log("start-game error", error);
      socket.emit("error", "Unable to start game right now");
    }
  });
};

module.exports.clearRoomTimer = clearRoomTimer;
module.exports.continueGame = continueGame;
