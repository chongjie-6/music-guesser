const { ERAS, currentGenres } = require("./songService");

const rooms = new Map();

const MAX_PLAYERS = 8;
const MAX_ROOM_SIZE = 16;
const MAX_NAME_LENGTH = 20;
const KINDS = ["party", "solo", "daily"];

const DEFAULT_SETTINGS = { rounds: 10, roundSeconds: 15, mode: "title", genre: "any", era: "any" };
const DAILY_SETTINGS = { ...DEFAULT_SETTINGS, rounds: 5 };
const SETTING_CHOICES = {
  rounds: [5, 10, 15, 20],
  roundSeconds: [10, 15, 20, 30],
  mode: ["title", "artist", "choice"],
  era: ["any", ...Object.keys(ERAS)],
};

const isValidRoomId = (roomID) =>
  typeof roomID === "string" && roomID.trim() !== "" && roomID.length <= 64;

const cleanName = (name) =>
  (typeof name === "string" && name.trim().slice(0, MAX_NAME_LENGTH)) || "Anonymous";

const getRoom = (roomId) => rooms.get(roomId);

const createRoom = (roomId, kind, hostId) => {
  const room = {
    id: roomId,
    kind,
    hostId,
    settings: { ...(kind === "daily" ? DAILY_SETTINGS : DEFAULT_SETTINGS) },
    dailyDate: kind === "daily" ? new Date().toISOString().slice(0, 10) : null,
    players: new Map(),
    kicked: new Set(),
    playedSongIds: new Set(),
    game: null,
    timer: null,
    destroyTimer: null,
  };
  rooms.set(roomId, room);
  return room;
};

const deleteRoom = (room) => {
  room.game = null;
  rooms.delete(room.id);
};

const isRunning = (room) => ["loading", "active", "break"].includes(room.game?.status);

const seatedPlayers = (room) => [...room.players.values()].filter((p) => !p.spectator);

const connectedCount = (room) =>
  [...room.players.values()].filter((p) => p.connected).length;

/**
 * Adds a player, or reconnects one who was already here (keeping their score).
 */
const addPlayer = (room, { id, name, socketId }) => {
  if (room.kicked.has(id)) return { error: "You were kicked from this room" };

  const existing = room.players.get(id);
  if (existing) {
    const previousSocketId = existing.socketId;
    Object.assign(existing, { name, socketId, connected: true });
    return { player: existing, previousSocketId, rejoined: true };
  }

  const capacity = room.kind === "party" ? MAX_ROOM_SIZE : 1;
  if (room.players.size >= capacity) return { error: "Room is full" };

  const player = {
    id,
    name,
    socketId,
    connected: true,
    spectator: seatedPlayers(room).length >= MAX_PLAYERS,
    score: 0,
  };
  room.players.set(id, player);
  return { player, rejoined: false };
};

const removePlayer = (room, playerId) => room.players.delete(playerId);

const seatPlayers = (room) => {
  let free = MAX_PLAYERS - seatedPlayers(room).length;
  for (const player of room.players.values()) {
    if (free <= 0) break;
    if (player.spectator && player.connected) {
      player.spectator = false;
      free--;
    }
  }
};

/**
 * Hands the host role to another connected player if the host is gone.
 * Returns the new host, if it changed.
 */
const ensureHost = (room) => {
  if (room.players.get(room.hostId)?.connected) return null;
  const players = [...room.players.values()].filter((p) => p.connected);
  const next = players.find((p) => !p.spectator) ?? players[0];
  if (!next) return null;
  room.hostId = next.id;
  return next;
};

const prepareForGame = (room) => {
  for (const player of room.players.values()) {
    if (!player.connected) room.players.delete(player.id);
    else player.score = 0;
  }
  seatPlayers(room);
};

/**
 * Applies the valid entries of a partial settings update.
 */
const applySettings = (room, changes) => {
  const choices = { ...SETTING_CHOICES, genre: ["any", ...currentGenres()] };
  for (const [key, value] of Object.entries(changes ?? {})) {
    if (choices[key]?.includes(value)) room.settings[key] = value;
  }
};

const publicRoom = (room) => ({
  roomId: room.id,
  kind: room.kind,
  hostId: room.hostId,
  dailyDate: room.dailyDate,
  settings: room.settings,
  genres: currentGenres(),
  running: isRunning(room),
  maxPlayers: MAX_PLAYERS,
  players: [...room.players.values()].map(({ id, name, score, connected, spectator }) => ({
    id,
    name,
    score,
    connected,
    spectator,
    guessed: room.game?.status === "active" && !!room.game.guessers?.some((g) => g.id === id),
  })),
});

/**
 * The room and player for a socket that is currently in that room.
 */
const playerFor = (socket, roomId) => {
  const room = rooms.get(roomId);
  const player = room?.players.get(socket.data.playerId);
  if (!player || player.socketId !== socket.id) return null;
  return { room, player };
};

const broadcastRoom = (io, room) => io.in(room.id).emit("room-state", publicRoom(room));

const systemMessage = (io, room, message) =>
  io.in(room.id).emit("newMessage", { message, senderId: "", senderName: "", type: "system" });

module.exports = {
  KINDS,
  MAX_PLAYERS,
  isValidRoomId,
  cleanName,
  getRoom,
  createRoom,
  deleteRoom,
  isRunning,
  seatedPlayers,
  connectedCount,
  addPlayer,
  removePlayer,
  seatPlayers,
  ensureHost,
  prepareForGame,
  applySettings,
  publicRoom,
  playerFor,
  broadcastRoom,
  systemMessage,
};
