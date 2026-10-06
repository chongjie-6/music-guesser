import { useState } from "react";
import type { GameEnd } from "../types/types";
import InfiniteLooper from "./InfiniteLooper";

const RANK_LABELS = ["1ST", "2ND", "3RD", "4TH", "5TH"];
const RANK_CLASSES = [
  "score-row-top glow-yellow",
  "score-row-2 glow-cyan",
  "score-row-3 glow-magenta",
  "score-row-dim text-yellow-200/40",
  "score-row-dim text-yellow-200/30",
];
const GRID = ["⬛", "🟧", "🟨", "🟩"];

export default function GameOverScreen({
  result,
  onClose,
  closeLabel,
}: {
  result: GameEnd;
  onClose: () => void;
  closeLabel: string;
}) {
  const [shared, setShared] = useState(false);
  const roundMax = result.maxScore / result.recap.length;
  // Daily rooms are solo, so any guesser is the player
  const grid = result.recap
    .map((r) => GRID[Math.ceil(((r.guessers[0]?.points ?? 0) / roundMax) * 3)])
    .join("");

  const share = () => {
    const text = [
      `BEAT THE DROP DAILY ${result.daily}`,
      `${grid} ${result.topScore}/${result.maxScore}`,
      window.location.origin,
    ].join("\n");
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
      return;
    }
    navigator.clipboard?.writeText(text).then(() => {
      setShared(true);
      setTimeout(() => setShared(false), 1500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex overflow-y-auto p-4 bg-cab-black/95 bg-pixel-grid">
      {/* CRT glow */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-yellow-300/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md m-auto">
        {/* Top marquee */}
        <div className="marquee-wrap mb-4">
          <InfiniteLooper
            speed={12}
            direction={"left"}
            items={["GAME OVER", "GAME OVER", "GAME OVER", "GAME OVER"]}
          />
        </div>

        <div className="pixel-box p-5 sm:p-8">
          <div className="pixel-rule-rainbow mb-6" />

          <p className="font-display text-sm glow-yellow tracking-[.3em] uppercase mb-4">
            ◈ {result.daily ? `DAILY ${result.daily}` : "GAME OVER"} ◈
          </p>

          {result.daily ? (
            <>
              <p className="text-3xl tracking-widest mb-2">
                {grid}
              </p>
              <p className="font-body text-2xl glow-yellow mb-4">{result.topScore} PTS</p>
              <button onClick={share} className="btn btn-cyan text-sm">
                {shared ? "COPIED!" : "SHARE RESULT"}
              </button>
            </>
          ) : result.isTie ? (
            <>
              <h2 className="font-display text-lg sm:text-2xl glow-cyan uppercase mb-1">
                IT'S A TIE!
              </h2>
              <p className="font-body text-2xl text-yellow-200/60">
                {result.topScore} PTS EACH
              </p>
            </>
          ) : result.winner ? (
            <>
              <p className="font-display text-sm text-yellow-500/60 tracking-widest mb-2 uppercase">
                WINNER
              </p>
              <h2 className="font-display text-lg sm:text-2xl text-rainbow uppercase leading-snug wrap-anywhere mb-1">
                {result.winner.toUpperCase()}
              </h2>
              <p className="font-body text-2xl glow-yellow">
                {result.topScore} PTS
              </p>
            </>
          ) : (
            <h2 className="font-display text-xl text-yellow-600/60 uppercase">
              NO WINNER
            </h2>
          )}

          {!result.daily && result.scores.length > 0 && (
            <div className="mt-6 flex flex-col gap-1.5">
              {result.scores.map(({ id, name, score }, i) => (
                <div
                  key={id}
                  className={`flex items-center justify-between gap-3 px-3 sm:px-4 py-2.5 font-display text-xs sm:text-sm ${RANK_CLASSES[i] ?? RANK_CLASSES[3]}`}
                >
                  <span className="wrap-anywhere">
                    {RANK_LABELS[i] ?? `${i + 1}.`} {name.toUpperCase()}
                  </span>
                  <span className="shrink-0">{score} PTS</span>
                </div>
              ))}
            </div>
          )}

          <p className="font-display text-xs glow-cyan tracking-widest mt-6 mb-2">TRACKLIST</p>
          <ol className="flex flex-col gap-2">
            {result.recap.map((song, i) => (
              <li key={i} className="flex items-center gap-3 border border-cyan-400/15 p-2">
                {song.artwork && (
                  <img src={song.artwork} alt="" className="h-10 w-10 shrink-0" />
                )}
                <div className="min-w-0 flex-1 font-body text-lg leading-tight">
                  <p className="text-cyan-100 wrap-anywhere">{song.answer}</p>
                  {song.artistUrl ? (
                    <a
                      href={song.artistUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-arcade-magenta underline wrap-anywhere"
                    >
                      {song.artist}
                    </a>
                  ) : (
                    <p className="text-arcade-magenta wrap-anywhere">{song.artist}</p>
                  )}
                </div>
                <span className="shrink-0 font-display text-[10px] text-right leading-relaxed">
                  {song.guessers.length === 0 && <span className="text-yellow-600/50">MISSED</span>}
                  {song.guessers.map((g) => (
                    <span key={g.id} className="block max-w-24 truncate glow-green">
                      {result.daily ? "" : `${g.name.toUpperCase()} `}+{g.points}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ol>

          <button
            onClick={onClose}
            className="btn btn-yellow-fill w-full mt-6 py-3 text-sm tracking-widest"
          >
            {closeLabel}
          </button>

          <div className="pixel-rule-rainbow mt-6" />
          <p className="font-display text-[7px] text-yellow-600/30 mt-3 text-center blink tracking-widest">
            INSERT COIN TO CONTINUE
          </p>
        </div>
      </div>
    </div>
  );
}
