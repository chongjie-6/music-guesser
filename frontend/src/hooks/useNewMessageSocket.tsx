import { useEffect } from "react";
import { socket } from "../socket";
import type { Message } from "../types/types";

export function useNewMessageSocket(
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
) {
  useEffect(() => {
    socket.on("newMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    return () => {
      socket.off("newMessage");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
