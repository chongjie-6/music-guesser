import type { RefObject } from "react";
import { socket } from "../socket";
import type { GameRound } from "../types/types";
import Countdown from "./Countdown";
import MusicPlayer from "./MusicPlayer";
import PixelArt from "./PixelArt";

// Art gets sharper with each hint, but is never fully clear until the reveal
const ART_BLOCKS = [4, 6, 10, 16];

const MODE_LABELS = {
  title: "GUESS THE TITLE",
  artist: "GUESS THE ARTIST",
  choice: "PICK THE TITLE",
};

const Hint = ({ label, value }: { label: string; value?: string }) => (
  <p>
    {label}:{" "}
    {value ? (
      <span className="glow-magenta">{value}</span>
    ) : (
      <span className="text-cyan-200/30">???</span>
    )}
  </p>
);

export default function RoundPanel({
  roomId,
  round,
  deadline,
  audioRef,
  canPlay,
}: {
  roomId: string;
  round: GameRound;
  deadline: number | null;
  audioRef: RefObject<HTMLAudioElement | null>;
  canPlay: boolean;
}) {
  const { hints, mode, options, picked, solved, musicStopped } = round;

  return (
    <div className="pixel-box-cyan p-4">
      <div className="pixel-rule-cyan mb-3" />
      <p className="font-display text-sm glow-cyan uppercase tracking-widest mb-1">
        — ROUND {round.round} / {round.totalRounds} —
      </p>
      <p className="font-display text-xs text-cyan-500/60 mb-3">{MODE_LABELS[mode]}</p>
      {deadline !== null && (
        <p className={`font-display text-sm mb-3 ${musicStopped ? "glow-red" : "glow-yellow"}`}>
          {musicStopped ? "MUSIC STOPPED · " : "⏱ "}
          {/* Remount per deadline so the first render isn't a stale tick */}
          <Countdown key={deadline} deadline={deadline} />s LEFT
        </p>
      )}

      <div className="flex gap-3">
        {round.artwork && (
          <PixelArt src={round.artwork} blocks={ART_BLOCKS[round.stage] ?? 16} />
        )}
        <div className="font-body text-xl leading-tight space-y-1 text-cyan-200/80 min-w-0 wrap-anywhere">
          <Hint label="YEAR" value={hints.year} />
          <Hint label="GENRE" value={hints.genre} />
          {mode === "title" && <Hint label="ARTIST" value={hints.artist} />}
        </div>
      </div>
      {mode !== "choice" && (
        <p className="mt-2 font-body text-xl text-cyan-200/80 wrap-anywhere">
          {mode === "artist" ? "ARTIST" : "TITLE"}:{" "}
          {hints.letters ? (
            <span className="glow-yellow tracking-[0.2em]">{hints.letters}</span>
          ) : (
            <span className="text-cyan-200/30">???</span>
          )}
        </p>
      )}

      {solved && (
        <p className="mt-3 border-2 border-arcade-green/50 p-2 font-display text-xs leading-relaxed glow-green wrap-anywhere">
          ✓ YOU GOT IT! +{solved.points} · {solved.answer}
        </p>
      )}

      <MusicPlayer
        src={round.previewUrl}
        audioRef={audioRef}
        stopped={musicStopped}
        startAt={round.elapsedMs / 1000}
      />

      {options && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {options.map((option, i) => (
            <button
              key={option}
              onClick={() => socket.emit("pick-option", { roomId, index: i })}
              disabled={!canPlay || picked !== null}
              className={`btn text-left leading-relaxed wrap-anywhere ${
                picked !== i ? "btn-cyan" : solved ? "btn-green" : "btn-red"
              }`}
            >
              {picked === i && (solved ? "✓ " : "✕ ")}
              {option}
            </button>
          ))}
        </div>
      )}
      <div className="pixel-rule-cyan mt-3" />
    </div>
  );
}
