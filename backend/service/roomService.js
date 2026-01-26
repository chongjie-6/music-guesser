const createRoom = (roomID, maxPlayers) => {
    io.on("connection", (socket) => {
      socket.join(roomID);
      console.log(`Socket ${socket.id} joined room ${roomID}`);
    });
    return roomID;
};

module.exports = {
  createRoom,
};
