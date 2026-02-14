import { socket } from "../socket";
export default function UserNameForm() {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (socket.id) {
      socket.emit("set-username", { socketId: socket.id, username: formData.get("username") });
      e.currentTarget.reset();
    }
  };

  return (
    <form className="inline-flex" onSubmit={onSubmit}>
      <input
        name="username"
        placeholder="Type your username..."
        className="w-full p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="ml-2 bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-600"
      >
        Set
      </button>
    </form>
  );
}
