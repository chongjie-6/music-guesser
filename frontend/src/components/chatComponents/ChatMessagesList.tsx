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
    <div className="pixel-box flex h-[70vh] w-full flex-col p-4">
      <div className="pixel-rule-rainbow mb-3" />
      <h2 className="font-display text-[9px] glow-yellow uppercase tracking-widest mb-3">
        ▶ CHAT FEED
      </h2>

      <div ref={scrollRef}
        className="mb-3 flex-1 space-y-1.5 overflow-y-auto border-2 border-yellow-400/20 bg-cab-black p-3 crt-surface">
        {messages.length === 0 && (
          <p className="font-display text-[8px] text-yellow-700/40 uppercase tracking-widest text-center mt-4 blink">
            WAITING FOR PLAYERS...
          </p>
        )}
        {messages.map((message, idx) => (
          <div key={idx} className="border border-yellow-400/8 bg-yellow-400/2 px-2 py-1.5 font-display text-[8px] leading-relaxed">
            <span className="glow-magenta">{(message.senderName || message.senderId).toUpperCase()}</span>
            <span className="text-yellow-600/50 mx-1.5">&gt;</span>
            <span className="text-yellow-200/70">{message.message}</span>
          </div>
        ))}
      </div>

      <ChatMessageInput roomId={roomId} />
    </div>
  );
}