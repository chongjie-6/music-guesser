import { useEffect } from "react";
import { socket } from "../socket";

export function useErrorSocket(
  setError: React.Dispatch<React.SetStateAction<string>>,
) {
  useEffect(() => {
    socket.on("error", (message) => {
      setError(message);
    });
    return () => {
      socket.off("error");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
