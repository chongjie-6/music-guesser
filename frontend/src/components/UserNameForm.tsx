import { socket } from "../socket";

export default function UserNameForm() {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (socket.id) {
      socket.emit("set-username", {
        socketId: socket.id,
        username: formData.get("username"),
      });
      e.currentTarget.reset();
    }
  };

  return (
    <form className="flex gap-2" onSubmit={onSubmit}>
      <input
        name="username"
        placeholder="Set username"
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 placeholder:text-slate-400 focus:ring-2"
      />
      <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
        Save
      </button>
    </form>
  );
}
