import { useEffect } from "react";
import { socket } from "../socket";

export function useJoinRoom(roomId: string | undefined) {
  useEffect(() => {
    if (!roomId) return;

    const joinRoom = () => {
      socket.emit("set-username", {
        username: sessionStorage.getItem("username")?.trim() || "Anonymous",
      });
      socket.emit("join-room", roomId);
    };

    // Reconnects get a new socket id, so the room has to be rejoined
    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);
    return () => {
      socket.off("connect", joinRoom);
      socket.emit("leave-room", roomId);
    };
  }, [roomId]);
}
