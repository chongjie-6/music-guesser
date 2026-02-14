module.exports = (io, socket) => {
  /**
   * Event: set-username
   */
  socket.on("set-username", ({ socketId, username }) => {
    console.log("Received set-username event:", { socketId, username });
    if (!socketId || !username || username.trim() === "") {
      socket.emit("error", "Invalid username");
      return;
    }
    socket.user = { name: username };
  });
};
