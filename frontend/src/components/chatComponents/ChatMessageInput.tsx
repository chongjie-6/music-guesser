import { socket } from "../../socket";

export default function ChatMessageInput({
  roomId,
  placeholder = "TYPE YOUR GUESS_",
}: {
  roomId: string | undefined;
  placeholder?: string;
}) {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (roomId) {
      socket.emit("send-message", { roomId, message: formData.get("message") });
      e.currentTarget.reset();
    }
  };

  return (
    <form className="flex gap-2" onSubmit={onSubmit}>
      <input
        name="message"
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="send"
        className="min-w-0 flex-1 border-2 border-yellow-400/40 bg-cab-black px-3 py-2.5 text-yellow-200 tracking-wider placeholder:text-yellow-200/40 transition-all"
      />
      <button type="submit" className="btn btn-yellow-fill text-sm px-4">
        SEND
      </button>
    </form>
  );
}
