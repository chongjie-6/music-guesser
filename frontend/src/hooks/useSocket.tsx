import { useEffect } from "react";
import { type Socket } from "socket.io-client";

export const useSocket = (
  socket: Socket | null,
) => {
  useEffect(() => {
    if (!socket) return;

    socket.on("message", (message) => setSocketMessage(message));

    return () => {
      socket.off("message");
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
