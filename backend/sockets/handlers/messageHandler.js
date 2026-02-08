module.exports = (io, socket) => {
  /**
   * Event: receive-message
   */
  socket.on("chatMessage", ({ roomId, message }) => {
    if (message.trim() === "") return;
    console.log(roomId, message);
    console.log("JSOILFJSDLIJF");

    const messageData = { message: message, senderId: socket.id };

    console.log("Emitting Message to room:", roomId, messageData);
    io.in(roomId).emit("newMessage", messageData);
    console.log(`Message received: ${message} from socket ${socket.id}`);
  });
};
