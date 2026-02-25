import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../../socket";
import { useErrorSocket } from "../../hooks/useErrorSocket";

export default function PlayWithFriendsPage() {
  const [socketMessage, setSocketMessage] = useState<string>("");
  const [roomID, setRoomID] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate();

  useErrorSocket(setSocketMessage);

  const setUsernameOnSocket = (name: string) => {
    if (socket.id && name.trim()) {
      socket.emit("set-username", {
        socketId: socket.id,
        username: name.trim(),
      });
    }
  };

  const handleJoinRoom = () => {
    if (!roomID.trim()) return;
    if (!username.trim()) {
      setSocketMessage("Please enter a username before joining.");
      return;
    }
    setUsernameOnSocket(username);
    socket.emit("join-room", roomID);
    navigate(`/play-with-friends/room/${roomID}`);
  };

  const handleCreateRoom = () => {
    if (!username.trim()) {
      setSocketMessage("Please enter a username before creating a room.");
      return;
    }
    const newRoomID = crypto.randomUUID();
    setUsernameOnSocket(username);
    socket.emit("create-room", newRoomID);
    navigate(`/play-with-friends/room/${newRoomID}`);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Multiplayer lobby</h1>
        <p className="mt-2 text-slate-600">Set your name, then create or join a room.</p>

        {socketMessage && (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {socketMessage}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Your name
            </label>
            <input
              type="text"
              placeholder="e.g. Alex"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none ring-slate-400 placeholder:text-slate-400 focus:ring-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Room ID <span className="font-normal text-slate-400">(leave blank to create)</span>
            </label>
            <input
              type="text"
              placeholder="Paste a room ID to join"
              value={roomID}
              onChange={(e) => setRoomID(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none ring-slate-400 placeholder:text-slate-400 focus:ring-2"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={handleJoinRoom}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            Join room
          </button>
          <button
            onClick={handleCreateRoom}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Create room
          </button>
        </div>
      </section>
    </main>
  );
}