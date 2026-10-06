const { playerFor, isRunning, broadcastRoom, systemMessage } = require("../../service/roomService");
const {
  HINT_STAGES,
  SILENT_GUESS_MS,
  startGame,
  beginRound,
  roundPayload,
  revealHint,
  stopMusic,
  pickOption,
  recordSolve,
  roundDone,
  finishRound,
} = require("../../service/gameService");

const clearRoomTimer = (room) => {
  clearTimeout(room.timer);
  room.timer = null;
};

/**
 * Reveals a hint every quarter of the music, then stops it and gives players
 * a little longer to guess before ending the round.
 */
const scheduleRound = (io, room) => {
  const step = room.game.musicMs / HINT_STAGES;
  const later = (ms, fn) => {
    room.timer = setTimeout(fn, ms);
  };

  const hint = () => {
    const update = revealHint(room);
    io.in(room.id).emit("game-hint", update);
    later(step, update.stage < HINT_STAGES - 1 ? hint : silence);
  };
  const silence = () => {
    stopMusic(room, SILENT_GUESS_MS);
    io.in(room.id).emit("game-music-stop", { timeLeftMs: SILENT_GUESS_MS });
    later(SILENT_GUESS_MS, () => endRound(io, room));
  };

  later(step, hint);
};

const startRound = (io, room) => {
  clearRoomTimer(room);
  beginRound(room);
  io.in(room.id).emit("game-round", roundPayload(room));
  // Clears last round's ticks next to the players who got it
  broadcastRoom(io, room);
  scheduleRound(io, room);
};

/**
 * Reveals the answer, then starts the next round or ends the game.
 */
const endRound = (io, room) => {
  clearRoomTimer(room);
  const { reveal, result } = finishRound(room);
  const answer = `${reveal.answer} — ${reveal.artist}`.toUpperCase();

  io.in(room.id).emit("round-end", reveal);
  systemMessage(io, room, reveal.guessers.length ? `ANSWER: ${answer}` : `NOBODY GOT IT! · ${answer}`);

  if (!result) return startRound(io, room);
  io.in(room.id).emit("game-end", result);
  broadcastRoom(io, room);
  systemMessage(io, room, "GAME OVER");
  console.log(`Game over in room ${room.id}. Winner: ${result.winner}`);
};

const endRoundIfDone = (io, room) => {
  if (roundDone(room)) endRound(io, room);
};

/**
 * Scores a correct guess without giving the answer away to anyone still guessing.
 */
const solve = (io, room, player) => {
  const solved = recordSolve(room, player);
  if (!solved) return;
  io.to(player.socketId).emit("guess-result", solved);
  systemMessage(io, room, `${player.name.toUpperCase()} GOT IT! +${solved.points}`);
  broadcastRoom(io, room);
  endRoundIfDone(io, room);
};

/**
 * Sends the round in progress to one socket, e.g. a late joiner.
 */
const sendRound = (socket, room) => {
  if (room.game?.status === "active" && room.game.round > 0) {
    socket.emit("game-round", roundPayload(room, socket.data.playerId));
  }
};

const hostOf = (socket, roomId) => {
  const found = playerFor(socket, roomId);
  if (found && found.room.hostId === found.player.id) return found;
  socket.emit("error", found ? "Only the host can do that" : "You are not in this room");
  return null;
};

module.exports = (io, socket) => {
  socket.on("start-game", async (roomId) => {
    const found = hostOf(socket, roomId);
    if (!found) return;
    const { room } = found;
    if (isRunning(room)) {
      socket.emit("error", "Game is already active");
      return;
    }

    try {
      const loading = startGame(room);
      // Hides the start button and settings while the songs load
      broadcastRoom(io, room);
      if (!(await loading)) return;
    } catch (error) {
      console.log("start-game error", error);
      socket.emit("error", error.expose ? error.message : "Unable to start game right now");
      broadcastRoom(io, room);
      return;
    }

    io.in(room.id).emit("game-started");
    broadcastRoom(io, room);
    systemMessage(io, room, "GAME STARTED!");
    startRound(io, room);
  });

  socket.on("pick-option", (payload) => {
    const { roomId, index } = payload || {};
    const found = playerFor(socket, roomId);
    if (!found || found.player.spectator) return;
    const { room, player } = found;

    const verdict = pickOption(room, player.id, index);
    if (!verdict) return;
    socket.emit("pick-result", { index, correct: verdict === "correct" });
    if (verdict === "correct") solve(io, room, player);
    else endRoundIfDone(io, room);
  });
};

module.exports.clearRoomTimer = clearRoomTimer;
module.exports.startRound = startRound;
module.exports.endRoundIfDone = endRoundIfDone;
module.exports.solve = solve;
module.exports.sendRound = sendRound;
module.exports.hostOf = hostOf;
