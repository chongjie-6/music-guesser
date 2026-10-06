import { useEffect, useRef } from "react";
import type { Message } from "../../types/types";
import ChatMessageInput from "./ChatMessageInput";

const MessageLine = ({ message, small }: { message: Message; small?: boolean }) =>
  message.type === "system" ? (
    <p
      className={`px-2 py-1 font-display leading-relaxed glow-cyan wrap-anywhere ${small ? "text-[10px]" : "text-xs"}`}
    >
      » {message.message}
    </p>
  ) : (
    <div
      className={`border border-yellow-400/8 bg-yellow-400/2 px-2 py-1.5 font-display leading-relaxed wrap-anywhere ${small ? "text-[10px]" : "text-sm"}`}
    >
      <span className="glow-magenta">{message.senderName.toUpperCase()}</span>
      <span className="text-yellow-600/50 mx-1.5">&gt;</span>
      <span className="text-yellow-200/70">{message.message}</span>
      {message.type === "close" && <span className="glow-orange ml-2">CLOSE!</span>}
      {message.type === "solved" && (
        <span className="glow-green ml-2">(ONLY PLAYERS WHO GOT IT SEE THIS)</span>
      )}
    </div>
  );

export default function ChatMessages({
  messages,
  roomId,
  placeholder,
}: {
  messages: Message[];
  roomId: string | undefined;
  placeholder?: string;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    if (isNearBottom) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div className="pixel-box flex h-[50dvh] w-full flex-col p-4 lg:h-[70dvh]">
      <div className="pixel-rule-rainbow mb-3" />
      <h2 className="font-display text-sm glow-yellow uppercase tracking-widest mb-3">
        ▶ CHAT FEED
      </h2>
      <div
        ref={scrollRef}
        className="mb-3 flex-1 space-y-1.5 overflow-y-auto border-2 border-yellow-400/20 bg-cab-black p-3 crt-surface"
      >
        {messages.length === 0 && (
          <p className="font-display text-sm text-yellow-700/40 uppercase tracking-widest text-center mt-4 blink">
            WAITING FOR PLAYERS...
          </p>
        )}
        {messages.map((message, idx) => (
          <MessageLine key={idx} message={message} />
        ))}
      </div>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-yellow-400/40 bg-cab-dark p-3 lg:static lg:border-0 lg:bg-transparent lg:p-0">
        {/* On phones the feed sits far below the round, so the latest lines ride along with the input */}
        <div className="mb-2 flex max-h-24 flex-col justify-end gap-1 overflow-hidden empty:hidden lg:hidden">
          {messages.slice(-2).map((message, idx) => (
            <MessageLine key={idx} message={message} small />
          ))}
        </div>
        <ChatMessageInput roomId={roomId} placeholder={placeholder} />
      </div>
    </div>
  );
}
