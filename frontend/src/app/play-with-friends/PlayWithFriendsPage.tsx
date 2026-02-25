import { useState } from "react";
import { socket } from "../../socket";
import { useErrorSocket } from "../../hooks/useErrorSocket";
import { CreateRoomButton } from "../../components/buttons/CreateRoomButton";
import { JoinRoomButton } from "../../components/buttons/JoinRoomButton";

export default function PlayWithFriendsPage() {
  const [socketMessage, setSocketMessage] = useState<string>("");
  const [roomID, setRoomID] = useState<string>("");
  const [username, setUsername] = useState<string>(
    sessionStorage.getItem("username") || "",
  );

  useErrorSocket(setSocketMessage);

  const handleSetUsername = (userName: string) => {
    setUsername(userName);
    sessionStorage.setItem("username", userName);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Multiplayer lobby
        </h1>
        <p className="mt-2 text-slate-600">
          Set your name, then create or join a room.
        </p>

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
              onChange={(e) => handleSetUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none ring-slate-400 placeholder:text-slate-400 focus:ring-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Room ID{" "}
              <span className="font-normal text-slate-400">
                (leave blank to create)
              </span>
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
          <JoinRoomButton socket={socket} roomID={roomID} />
          <CreateRoomButton socket={socket} />
        </div>
      </section>
    </main>
  );
}
