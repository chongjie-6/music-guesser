const {
  checkRoomExists,
  checkMaxPlayersReached,
  isValidRoomId,
  isInRoom,
} = require("../../service/roomService");
const { clearRoomTimer } = require("./gameHandler");
const { destroyRoomGame } = require("../../service/gameService");

const destroyRoom = (roomId) => {
  clearRoomTimer(roomId);
  destroyRoomGame(roomId);
  console.log(`Room ${roomId} destroyed — no players remaining`);
};

module.exports = (io, socket) => {
  /**
   * Event: create-room
   * Payload: roomID string
   */
  socket.on("create-room", (roomID) => {
    if (!isValidRoomId(roomID)) {
      socket.emit("error", "Invalid room ID");
      return;
    }

    if (checkRoomExists(roomID, io)) {
      socket.emit("error", "Room already exists");
      return;
    }

    socket.join(roomID);
    console.log(`${socket.id} created room: ${roomID}`);
  });

  /**
   * Event: join-room
   * Payload: roomID string
   */
  socket.on("join-room", (roomID) => {
    if (!isValidRoomId(roomID)) {
      socket.emit("error", "Invalid room ID");
      return;
    }

    if (socket.rooms.has(roomID)) return;

    // Every socket has a private room named after its id; those aren't joinable
    if (!checkRoomExists(roomID, io) || io.sockets.sockets.has(roomID)) {
      socket.emit("error", "Room does not exist");
      return;
    }

    if (checkMaxPlayersReached(roomID, io)) {
      socket.emit("error", "Room is full");
      return;
    }

    socket.join(roomID);
    console.log(`${socket.id} joined room: ${roomID}`);
  });

  /**
   * Event: leave-room
   * Payload: roomID string
   */
  socket.on("leave-room", (roomID) => {
    if (!isInRoom(socket, roomID)) return;

    socket.leave(roomID);
    if (!checkRoomExists(roomID, io)) destroyRoom(roomID);
  });

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (roomId === socket.id) continue;
      if (io.sockets.adapter.rooms.get(roomId)?.size === 1) destroyRoom(roomId);
    }
  });
};
