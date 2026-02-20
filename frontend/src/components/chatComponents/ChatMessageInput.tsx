import { socket } from "../../socket";

export default function ChatMessageInput({
  roomId,
}: {
  roomId: string | undefined;
}) {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (roomId) {
      socket.emit("send-message", {
        roomId: roomId,
        message: formData.get("message"),
      });
      e.currentTarget.reset();
    }
  };

  return (
    <form className="flex gap-2" onSubmit={onSubmit}>
      <input
        name="message"
        placeholder="Type a message"
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 placeholder:text-slate-400 focus:ring-2"
      />
      <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
        Send
      </button>
    </form>
  );
}
