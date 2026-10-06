import { socket } from "../socket";
import type { Player, RoomState } from "../types/types";

const RANK_CLASSES = ["score-row-top glow-yellow", "score-row-2 glow-cyan", "score-row-3 glow-magenta"];

export default function PlayersPanel({
  room,
  me,
  isHost,
}: {
  room: RoomState;
  me: string;
  isHost: boolean;
}) {
  const seated = room.players.filter((p) => !p.spectator).sort((a, b) => b.score - a.score);
  const spectators = room.players.filter((p) => p.spectator);

  const row = (player: Player, className: string, label: string) => (
    <li
      key={player.id}
      className={`flex items-center gap-2 px-3 py-2 font-display text-sm ${className} ${
        player.connected ? "" : "opacity-40"
      }`}
    >
      <span className="flex-1 wrap-anywhere">
        {label}
        {player.name.toUpperCase()}
        {player.id === me && <span className="text-arcade-green"> (YOU)</span>}
        {player.guessed && <span className="glow-green"> ✓</span>}
        {player.id === room.hostId && <span className="text-arcade-orange"> HOST</span>}
        {!player.connected && " (AWAY)"}
      </span>
      {!player.spectator && <span className="shrink-0">{player.score} PTS</span>}
      {isHost && player.id !== me && (
        <button
          onClick={() => socket.emit("kick-player", { roomId: room.roomId, playerId: player.id })}
          aria-label={`Kick ${player.name}`}
          title="Kick"
          className="-m-3 shrink-0 cursor-pointer p-3 text-arcade-red hover:text-white"
        >
          ✕
        </button>
      )}
    </li>
  );

  return (
    <div className="pixel-box p-4">
      <div className="pixel-rule-rainbow mb-3" />
      <p className="flex justify-between font-display text-sm glow-yellow mb-3 tracking-widest">
        <span>HI-SCORE TABLE</span>
        {room.kind === "party" && (
          <span>
            {seated.length}/{room.maxPlayers}
          </span>
        )}
      </p>
      <ul className="flex flex-col gap-1.5">
        {seated.map((p, i) =>
          row(p, RANK_CLASSES[i] ?? "score-row-dim text-yellow-200/40", `${i + 1}. `),
        )}
      </ul>
      {spectators.length > 0 && (
        <>
          <p className="font-display text-xs text-yellow-600/60 mt-4 mb-2 tracking-widest">
            SPECTATORS
          </p>
          <ul className="flex flex-col gap-1.5">
            {spectators.map((p) => row(p, "score-row-dim text-yellow-200/40", ""))}
          </ul>
        </>
      )}
    </div>
  );
}
