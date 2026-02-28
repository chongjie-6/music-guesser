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
    <main className="relative mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid-magenta" />
      <div className="pointer-events-none absolute top-0 left-1/3 h-96 w-96 rounded-full bg-fuchsia-500/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-cyan-500/8 blur-3xl" />

      <section className="brackets brackets-bottom brackets-magenta brackets-magenta-bottom relative w-full rounded-2xl p-8 card-magenta">
        <h1 className="font-display text-2xl font-bold uppercase tracking-widest glow-magenta">
          Multiplayer Lobby
        </h1>
        <p className="mt-2 text-blue-300/60 text-sm tracking-wide uppercase">
          Set your callsign, then create or join a room.
        </p>

        {socketMessage && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm glow-red">
            ⚠ {socketMessage}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1 block font-display text-xs font-semibold uppercase tracking-[0.2em] glow-cyan">
              Your Callsign
            </label>
            <input
              type="text"
              placeholder="e.g. SHADOW_X"
              value={username}
              onChange={(e) => handleSetUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-cyan-100 tracking-wider placeholder:text-slate-600 transition-all"
            />
          </div>

          <div>
            <label className="mb-1 block font-display text-xs font-semibold uppercase tracking-[0.2em] glow-magenta">
              Room ID{" "}
              <span className="font-normal text-slate-500 normal-case tracking-normal text-xs">
                (blank = create new)
              </span>
            </label>
            <input
              type="text"
              placeholder="Paste a room ID to infiltrate"
              value={roomID}
              onChange={(e) => setRoomID(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-fuchsia-100 tracking-wider placeholder:text-slate-600 transition-all"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <JoinRoomButton socket={socket} roomID={roomID} />
          <CreateRoomButton socket={socket} />
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 divider-magenta" />
      </section>
    </main>
  );
}