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
    <form
      className="fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t-2 border-yellow-400/40 bg-cab-dark p-3 lg:static lg:border-0 lg:bg-transparent lg:p-0"
      onSubmit={onSubmit}
    >
      <input
        name="message"
        placeholder={placeholder}
        className="min-w-0 flex-1 border-2 border-yellow-400/40 bg-cab-black px-3 py-2.5 text-yellow-200 tracking-wider placeholder:text-yellow-900/50 transition-all"
      />
      <button type="submit" className="btn btn-yellow-fill text-sm px-4">
        SEND
      </button>
    </form>
  );
}
