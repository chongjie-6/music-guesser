import { socket } from "../socket";

export function setUserNameSocket() {
  if (socket.id) {
    const userName = sessionStorage.getItem("username") || "Anonymous";
    socket.emit("set-username", {
      socketId: socket.id,
      username: userName.trim(),
    });
  }
}
