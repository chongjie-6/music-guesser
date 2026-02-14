module.exports = (io, socket) => {
  /**
   * Event: receive-message
   */
  socket.on("send-message", ({ roomId, message }) => {
    if (message.trim() === "") return;

    const messageData = { message: message, senderId: socket.id, senderName: socket.user?.name || "Anonymous" };

    console.log("Emitting Message to room:", roomId, messageData);
    io.in(roomId).emit("newMessage", messageData);
    console.log(`Message received: ${message} from socket ${socket.id}`);
  });
};
