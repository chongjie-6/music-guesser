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
    <div className="flex h-[70vh] w-full flex-col rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-base font-semibold text-slate-900">Chat</h2>
      <div className="mb-3 flex-1 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
        {messages.length === 0 && <p className="text-sm text-slate-500">No messages yet.</p>}
        {messages.map((message, idx) => (
          <div key={idx} className="rounded-md bg-white p-2 text-sm text-slate-700">
            <span className="font-medium text-slate-900">{message.senderName || message.senderId}</span>: {message.message}
          </div>
        ))}
      </div>

      <ChatMessageInput roomId={roomId} />
    </div>
  );
}
