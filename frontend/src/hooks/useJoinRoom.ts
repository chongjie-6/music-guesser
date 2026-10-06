import { useEffect } from "react";
import { savedName, socket } from "../socket";

export function useJoinRoom(roomId: string | undefined) {
  useEffect(() => {
    if (!roomId) return;
    const joinRoom = () => socket.emit("join-room", { roomId, name: savedName() });

    // Reconnects get a new socket, so the room has to be rejoined
    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);

    return () => {
      socket.off("connect", joinRoom);
      socket.emit("leave-room", roomId);
    };
  }, [roomId]);
}
