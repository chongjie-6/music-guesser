const MAX_USERNAME_LENGTH = 20;

module.exports = (io, socket) => {
  /**
   * Event: set-username
   */
  socket.on("set-username", (payload) => {
    const username =
      typeof payload?.username === "string" ? payload.username.trim() : "";
    if (!username) {
      socket.emit("error", "Invalid username");
      return;
    }
    socket.user = { name: username.slice(0, MAX_USERNAME_LENGTH) };
  });
};
