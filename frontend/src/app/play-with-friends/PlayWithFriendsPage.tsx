import { useState } from "react";
import { CreateRoomButton } from "../../components/buttons/CreateRoomButton";
import { JoinRoomButton } from "../../components/buttons/JoinRoomButton";
import { socket } from "../../socket";
import { useErrorSocket } from "../../hooks/useErrorSocket";

export default function PlayWithFriendsPage() {
  const [socketMessage, setSocketMessage] = useState<string>("");
  const [roomID, setRoomID] = useState<string | "">("");

  useErrorSocket(setSocketMessage);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Multiplayer lobby</h1>
        <p className="mt-2 text-slate-600">Create a room or join using a room ID.</p>

        {socketMessage && <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{socketMessage}</p>}

        <div className="mt-6">
          <input
            type="text"
            placeholder="Room ID"
            value={roomID}
            onChange={(e) => setRoomID(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none ring-slate-400 placeholder:text-slate-400 focus:ring-2"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <JoinRoomButton socket={socket} roomID={roomID} />
          <CreateRoomButton socket={socket} />
        </div>
      </section>
    </main>
  );
}
