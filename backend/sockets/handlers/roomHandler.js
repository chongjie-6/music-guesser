const {
  checkRoomExists,
  checkMaxPlayersReached,
} = require("../../service/roomService");

module.exports = (io, socket) => {
  /**
   * Event: create-room
   * Payload: { roomID: string }
   */
  socket.on("create-room", (roomID) => {
    if (!roomID || roomID.trim() === "") {
      socket.emit("error", "Invalid room ID");
      return;
    }

    if (checkRoomExists(roomID, io)) {
      socket.emit("error", "Room already exists");
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
    console.log(roomID);
    if (!roomID || roomID.trim() === "") {
      socket.emit("error", "Invalid room ID");
      return;
    }

    if (socket.id === roomID) {
      socket.emit("error", "You are already in the room!");
      return;
    }

    if (!checkRoomExists(roomID, io)) {
      socket.emit("error", "Room does not exist");
      return;
    }

    if (checkMaxPlayersReached(roomID, io))
      socket.emit("error", "Room is full");

    io.in(roomID).emit("user-joined", socket.id);
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
