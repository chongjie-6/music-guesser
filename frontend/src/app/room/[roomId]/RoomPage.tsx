import { useParams } from "react-router-dom";
import ChatMessages from "../../../components/chatComponents/ChatMessagesList";
import { useState } from "react";
import type { Message } from "../../../types/types";
import { useNewMessageSocket } from "../../../hooks/useNewMessageSocket";
import { socket } from "../../../socket";
import { useErrorSocket } from "../../../hooks/useErrorSocket";
import { StartGameButton } from "../../../components/buttons/StartGameButton";
import UserNameForm from "../../../components/UserNameForm";

export default function RoomPage() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string>("");

  socket.emit("join-room", roomId);
  useNewMessageSocket(setMessages);
  useErrorSocket(setError);

  return (
    <div className="flex w-screen justify-center">
      {error && <div>{error}</div>}
      <ChatMessages messages={messages} roomId={roomId} />
      <StartGameButton roomID={roomId} />
      <UserNameForm/>
    </div>
  );
}
