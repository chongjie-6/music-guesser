const gameHandler = require("./handlers/gameHandler");
const roomHandler = require("./handlers/roomHandler");
const messageHandler = require("./handlers/messageHandler");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    roomHandler(io, socket);
    gameHandler(io, socket);
    messageHandler(io, socket);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
