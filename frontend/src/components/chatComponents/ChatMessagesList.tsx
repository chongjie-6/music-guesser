import type { Message } from "../../types/types";
import ChatMessageInput from "./ChatMessageInput";

export default function ChatMessages({
  messages,
  roomId,
}: {
  messages: Message[];
  roomId: string | undefined;
}) {
  return (
    <div className="bg-white text-black p-3 rounded-lg space-y-2">
      {messages.map((message, idx) => (
        <div key={idx}>
          {message.senderName || message.senderId}: {message.message}
        </div>
      ))}

      <ChatMessageInput roomId={roomId} />
    </div>
  );
}
