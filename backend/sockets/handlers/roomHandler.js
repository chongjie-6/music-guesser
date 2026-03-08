const {
  checkRoomExists,
  checkMaxPlayersReached,
} = require("../../service/roomService");
const { clearRoomTimer } = require("./gameHandler");
const { destroyRoomGame } = require("../../service/gameService");

const destroyRoomIfEmpty = (roomId, io) => {
  const room = io.sockets.adapter.rooms.get(roomId);
  if (!room || room.size === 0) {
    clearRoomTimer(roomId);
    destroyRoomGame(roomId);
    console.log(`Room ${roomId} destroyed — no players remaining`);
  }
};

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
    if (!io.sockets.adapter.rooms.get(roomID)) {
      destroyRoomIfEmpty(roomID, io);
    } else {
      socket.to(roomID).emit("user-left", { userId: socket.id });
    }
    socket.emit("message", `Successfully left roomID: ${roomID}`);
  });

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (roomId === socket.id) continue;
      const room = io.sockets.adapter.rooms.get(roomId);
      if (room && room.size === 1) {
        clearRoomTimer(roomId);
        destroyRoomGame(roomId);
        console.log(`Room ${roomId} destroyed — last player disconnected`);
      }
    }
  });
};
