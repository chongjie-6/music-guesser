const {
  checkRoomExists,
  checkMaxPlayersReached,
} = require("../service/roomService");

module.exports = (io, socket) => {
  /**
   * Event: create-room
   * Payload: { roomID: string }
   */
  socket.on("create-room", (roomID) => {
    if (!roomID || roomID.trim() === "") {
      socket.emit("message", "Invalid room ID");
      return;
    }
    
    if (checkRoomExists(roomID, io)) {
      socket.emit("message", "Room already exists");
      return;
    }

    socket.join(roomID);
    socket.emit("message", `Successfully created roomID: ${roomID}`);
    console.log(`${socket.id} created room: ${roomID}`);
  });

  /**
   * Event: join-room
   * Payload: { roomID: string }
   */
  socket.on("join-room", (roomID) => {
    if (!roomID || roomID.trim() === "") {
      socket.emit("message", "Invalid room ID");
      return;
    }

    if (!checkRoomExists(roomID, io)) {
      socket.emit("message", "Room does not exist");
      return;
    }

    if (checkMaxPlayersReached(roomID, io))
      socket.emit("message", "Room is full");

    socket.to(roomID).emit("user-joined", socket.id);
    socket.join(roomID);
    socket.emit("message", `Successfully joined roomID: ${roomID}`);
    console.log(`${socket.id} joined room: ${roomID}`);
  });

  /**
   * Event: leave-room
   * Payload: { roomID: string }
   */
  socket.on("leave-room", (roomID) => {
    socket.leave(roomID);
    socket.to(roomID).emit("user-left", { userId: socket.id });
    socket.emit("message", `Successfully left roomID: ${roomID}`);
  });
};
