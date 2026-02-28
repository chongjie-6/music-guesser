import type { GameEnd } from "../types/types";

const RANK_LABELS = ["1ST", "2ND", "3RD", "4TH", "5TH"];
const RANK_CLASSES = [
  "score-row-top glow-yellow",
  "score-row-2 glow-cyan",
  "score-row-3 glow-magenta",
  "score-row-dim text-yellow-200/40",
  "score-row-dim text-yellow-200/30",
];

export default function GameOverScreen({
  result,
  onPlayAgain,
}: {
  result: GameEnd;
  onPlayAgain: () => void;
}) {
  const sorted = Object.entries(result.scores).sort(([, a], [, b]) => b - a);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cab-black/95 bg-pixel-grid">
      {/* CRT glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-yellow-300/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md mx-4">
        {/* Top marquee */}
        <div className="marquee-wrap mb-4">
          <div className="marquee-inner">
            ★ GAME OVER ★ GAME OVER ★ GAME OVER ★ GAME OVER ★&nbsp;
          </div>
        </div>

        <div className="pixel-box p-8">
          <div className="pixel-rule-rainbow mb-6" />

          <p className="font-display text-sm glow-yellow tracking-[.3em] uppercase mb-4">
            ◈ GAME OVER ◈
          </p>

          {result.isTie ? (
            <>
              <h2 className="font-display text-2xl glow-cyan uppercase mb-1">
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
              <h2 className="font-display text-2xl text-rainbow uppercase leading-snug mb-1">
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

          {sorted.length > 0 && (
            <div className="mt-6 flex flex-col gap-1.5">
              {sorted.map(([name, score], i) => (
                <div
                  key={name}
                  className={`flex items-center justify-between px-4 py-2.5 font-display text-sm ${RANK_CLASSES[i] ?? RANK_CLASSES[3]}`}
                >
                  <span>
                    {RANK_LABELS[i] ?? `${i + 1}.`} {name.toUpperCase()}
                  </span>
                  <span>{score} PTS</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={onPlayAgain}
            className="btn btn-yellow-fill w-full mt-6 py-3 text-sm tracking-widest"
          >
            ▶ PLAY AGAIN
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
