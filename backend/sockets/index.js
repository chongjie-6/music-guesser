const roomHandler = require("./roomHandler");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    roomHandler(io, socket);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
