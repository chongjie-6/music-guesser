const crypto = require("node:crypto");
const { loadGenres } = require("../service/songService");
const gameHandler = require("./handlers/gameHandler");
const roomHandler = require("./handlers/roomHandler");
const messageHandler = require("./handlers/messageHandler");

/**
 * Players reconnect as themselves by sending a secret key; others only ever see its hash.
 */
const playerIdOf = (socket) => {
  const key = socket.handshake.auth?.playerKey;
  const secret = typeof key === "string" && key.length >= 8 && key.length <= 64 ? key : socket.id;
  return crypto.createHash("sha256").update(secret).digest("hex").slice(0, 16);
};

module.exports = (io) => {
  loadGenres().catch((error) => console.log("Unable to load genres", error.message));

  io.use((socket, next) => {
    socket.data.playerId = playerIdOf(socket);
    next();
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    roomHandler(io, socket);
    gameHandler(io, socket);
    messageHandler(io, socket);
  });
};
