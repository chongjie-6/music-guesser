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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-pixel-grid px-4 py-10">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-cyan-400/4 blur-3xl" />
      </div>

      <div className="w-full max-w-lg">
        {/* Marquee header */}
        <div className="marquee-wrap mb-4">
          <div className="marquee-inner">
            ★ MULTIPLAYER LOBBY ★ CHOOSE YOUR CALLSIGN ★ CREATE OR JOIN A ROOM ★&nbsp;
          </div>
        </div>

        <div className="pixel-box-cyan p-8">
          <div className="pixel-rule-cyan mb-6" />

          <h1 className="font-display text-lg leading-snug glow-cyan uppercase mb-1">
            MULTIPLAYER
          </h1>
          <h2 className="font-display text-lg leading-snug glow-yellow uppercase mb-6">
            LOBBY
          </h2>

          {socketMessage && (
            <div className="pixel-box-red p-3 mb-5 font-display text-sm glow-red leading-relaxed">
              ⚠ ERROR: {socketMessage}
            </div>
          )}

          <div className="flex flex-col gap-5 mb-6">
            <div>
              <label className="font-display text-sm glow-yellow block mb-2 tracking-widest uppercase">
                YOUR CALLSIGN
              </label>
              <input
                type="text"
                placeholder="ENTER NAME_"
                value={username}
                onChange={(e) => handleSetUsername(e.target.value)}
                className="w-full border-2 border-yellow-400/50 bg-cab-black px-3 py-3 text-yellow-200 tracking-widest placeholder:text-yellow-900/60 transition-all"
              />
            </div>
            <div>
              <label className="font-display text-sm glow-cyan block mb-2 tracking-widest uppercase">
                ROOM CODE
                <span className="font-body text-base text-cyan-500/50 normal-case tracking-normal ml-2">
                  (blank = create new)
                </span>
              </label>
              <input
                type="text"
                placeholder="PASTE CODE HERE_"
                value={roomID}
                onChange={(e) => setRoomID(e.target.value)}
                className="w-full border-2 border-cyan-400/50 bg-cab-black px-3 py-3 text-cyan-200 tracking-widest placeholder:text-cyan-900/50 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <JoinRoomButton socket={socket} roomID={roomID} />
            <CreateRoomButton socket={socket} />
          </div>

          <div className="pixel-rule-yellow mt-8" />
          <p className="font-display text-sm text-yellow-600/40 mt-3 tracking-widest">
            INSERT COIN TO CONTINUE
          </p>
        </div>
      </div>
    </main>
  );
}