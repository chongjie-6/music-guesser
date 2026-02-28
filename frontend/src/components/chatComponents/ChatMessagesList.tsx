import { useEffect, useRef } from "react";
import type { Message } from "../../types/types";
import ChatMessageInput from "./ChatMessageInput";

export default function ChatMessages({ messages, roomId }: { messages: Message[]; roomId: string | undefined }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    if (isNearBottom) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div className="flex h-[70vh] w-full flex-col rounded-xl p-4 card-cyan">
      <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-[0.2em] glow-cyan">◈ Chat Feed</h2>
      <div ref={scrollRef}
        className="mb-3 flex-1 space-y-2 overflow-y-auto rounded-lg p-3 bg-space-950/60 border border-cyan-500/6 inset-glow-cyan">
        {messages.length === 0 && (
          <p className="font-display text-xs text-slate-600 uppercase tracking-widest text-center mt-4">
            No messages yet...
          </p>
        )}
        {messages.map((message, idx) => (
          <div key={idx} className="rounded-md px-3 py-2 text-sm row-dim">
            <span className="font-display text-xs font-semibold uppercase tracking-wider glow-magenta">
              {message.senderName || message.senderId}
            </span>
            <span className="text-slate-500 mx-1.5">›</span>
            <span className="text-slate-300">{message.message}</span>
          </div>
        ))}
      </div>
      <ChatMessageInput roomId={roomId} />
    </div>
  );
} 