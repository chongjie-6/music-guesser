const {
  KINDS,
  isValidRoomId,
  cleanName,
  getRoom,
  createRoom,
  deleteRoom,
  isRunning,
  connectedCount,
  addPlayer,
  removePlayer,
  seatPlayers,
  ensureHost,
  applySettings,
  playerFor,
  broadcastRoom,
  systemMessage,
} = require("../../service/roomService");
const { loadGenres } = require("../../service/songService");
const { clearRoomTimer, sendRound, hostOf, endRoundIfDone } = require("./gameHandler");

// Long enough to survive a page reload or a dropped connection
const EMPTY_ROOM_GRACE_MS = 30000;

const destroyRoom = (room) => {
  clearRoomTimer(room);
  clearTimeout(room.destroyTimer);
  deleteRoom(room);
  console.log(`Room ${room.id} destroyed — no players remaining`);
};

const destroyLaterIfEmpty = (room) => {
  if (connectedCount(room) > 0) return;
  clearTimeout(room.destroyTimer);
  room.destroyTimer = setTimeout(() => destroyRoom(room), EMPTY_ROOM_GRACE_MS);
};

const afterDeparture = (io, room, message) => {
  const newHost = ensureHost(room);
  if (!isRunning(room)) seatPlayers(room);
  broadcastRoom(io, room);
  systemMessage(io, room, message);
  if (newHost) systemMessage(io, room, `${newHost.name.toUpperCase()} IS NOW THE HOST`);
  // The player who left may have been the last one still guessing
  endRoundIfDone(io, room);
  destroyLaterIfEmpty(room);
};

module.exports = (io, socket) => {
  /**
   * Event: create-room
   * Payload: { roomId, kind: "party" | "solo" | "daily" }
   */
  socket.on("create-room", (payload) => {
    const { roomId, kind = "party" } = payload || {};
    // Every socket has a private room named after its id; those aren't usable
    if (!isValidRoomId(roomId) || !KINDS.includes(kind) || io.sockets.sockets.has(roomId)) {
      socket.emit("join-error", "Invalid room code");
      return;
    }
    if (getRoom(roomId)) {
      socket.emit("join-error", "Room already exists");
      return;
    }

    const room = createRoom(roomId, kind, socket.data.playerId);
    // Cleans up the room if its creator never makes it in
    destroyLaterIfEmpty(room);
    loadGenres()
      .then(() => broadcastRoom(io, room))
      .catch((error) => console.log("Unable to load genres", error.message));
    console.log(`${socket.data.playerId} created ${kind} room: ${roomId}`);
  });

  /**
   * Event: join-room
   * Payload: { roomId, name }
   */
  socket.on("join-room", (payload) => {
    const { roomId, name } = payload || {};
    const room = isValidRoomId(roomId) && getRoom(roomId);
    if (!room) {
      socket.emit("join-error", "Room does not exist");
      return;
    }

    const joined = addPlayer(room, {
      id: socket.data.playerId,
      name: cleanName(name),
      socketId: socket.id,
    });
    if (joined.error) {
      socket.emit("join-error", joined.error);
      return;
    }

    const { player, previousSocketId, rejoined } = joined;
    if (previousSocketId && previousSocketId !== socket.id) {
      const previous = io.sockets.sockets.get(previousSocketId);
      previous?.leave(room.id);
      previous?.emit("join-error", "You joined this room from another tab");
    }

    clearTimeout(room.destroyTimer);
    socket.join(room.id);
    socket.emit("joined", { playerId: player.id });
    ensureHost(room);
    broadcastRoom(io, room);
    if (!rejoined) {
      const as = player.spectator ? " AS A SPECTATOR" : "";
      systemMessage(io, room, `${player.name.toUpperCase()} JOINED${as}`);
    }
    sendRound(socket, room);
  });

  /**
   * Event: leave-room
   * Payload: roomId string
   */
  socket.on("leave-room", (roomId) => {
    const found = playerFor(socket, roomId);
    if (!found) return;
    socket.leave(roomId);
    removePlayer(found.room, found.player.id);
    afterDeparture(io, found.room, `${found.player.name.toUpperCase()} LEFT`);
  });

  /**
   * Event: update-settings (host only)
   * Payload: { roomId, settings }
   */
  socket.on("update-settings", (payload) => {
    const { roomId, settings } = payload || {};
    const found = hostOf(socket, roomId);
    if (!found || isRunning(found.room) || found.room.kind === "daily") return;
    applySettings(found.room, settings);
    broadcastRoom(io, found.room);
  });

  /**
   * Event: kick-player (host only)
   * Payload: { roomId, playerId }
   */
  socket.on("kick-player", (payload) => {
    const { roomId, playerId } = payload || {};
    const found = hostOf(socket, roomId);
    if (!found) return;
    const { room } = found;
    const target = room.players.get(playerId);
    if (!target || target.id === found.player.id) return;

    room.kicked.add(target.id);
    removePlayer(room, target.id);
    const targetSocket = io.sockets.sockets.get(target.socketId);
    targetSocket?.leave(room.id);
    targetSocket?.emit("join-error", "You were kicked from this room");
    afterDeparture(io, room, `${target.name.toUpperCase()} WAS KICKED`);
  });

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      const found = playerFor(socket, roomId);
      if (!found) continue;
      const { room, player } = found;
      // Seated players keep their score mid-game in case they reconnect
      if (isRunning(room) && !player.spectator) player.connected = false;
      else removePlayer(room, player.id);
      afterDeparture(io, room, `${player.name.toUpperCase()} DISCONNECTED`);
    }
  });
};
