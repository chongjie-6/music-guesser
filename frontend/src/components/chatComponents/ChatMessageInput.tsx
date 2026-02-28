import { socket } from "../../socket";

export default function ChatMessageInput({ roomId }: { roomId: string | undefined }) {
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
        placeholder="Type your guess..."
        className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-cyan-100 placeholder:text-slate-600 transition-all"
      />
      <button type="submit" className="btn btn-cyan px-4 py-2">Send</button>
    </form>
  );
}