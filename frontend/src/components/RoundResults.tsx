import { useState } from "react";
import type { GameRound, Reveal, RoomState } from "../types/types";

const RANK_CLASSES = ["score-row-top glow-yellow", "score-row-2 glow-cyan", "score-row-3 glow-magenta"];

export default function RoundResults({
  room,
  round,
  reveal,
  me,
}: {
  room: RoomState;
  round: GameRound;
  reveal: Reveal;
  me: string;
}) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  const gained = new Map(reveal.guessers.map((g) => [g.id, g.points]));
  const seated = room.players.filter((p) => !p.spectator).sort((a, b) => b.score - a.score);

  return (
    <div
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-40 flex overflow-y-auto p-4 bg-cab-black/80"
    >
      <div className="pixel-box relative w-full max-w-sm m-auto p-5">
        <div className="pixel-rule-rainbow mb-4" />
        <p className="font-display text-sm glow-yellow tracking-widest text-center mb-2">
          ROUND {round.round} / {round.totalRounds} RESULTS
        </p>
        <p className="font-body text-lg text-center text-cyan-200/70 mb-4 wrap-anywhere">
          {reveal.answer} · {reveal.artist}
        </p>

        <ul className="flex flex-col gap-1.5">
          {seated.map((p, i) => (
            <li
              key={p.id}
              className={`flex items-center gap-2 px-3 py-2 font-display text-xs ${
                RANK_CLASSES[i] ?? "score-row-dim text-yellow-200/40"
              }`}
            >
              <span className="flex-1 wrap-anywhere">
                {i + 1}. {p.name.toUpperCase()}
                {p.id === me && <span className="text-arcade-green"> (YOU)</span>}
              </span>
              <span className={`shrink-0 ${gained.has(p.id) ? "glow-green" : "opacity-40"}`}>
                +{gained.get(p.id) ?? 0}
              </span>
              <span className="shrink-0 w-20 text-right">{p.score} PTS</span>
            </li>
          ))}
        </ul>

        <p className="font-display text-[10px] glow-cyan text-center mt-4 blink tracking-widest">
          NEXT ROUND...
        </p>
        <div className="pixel-rule-rainbow mt-4" />
      </div>
    </div>
  );
}
