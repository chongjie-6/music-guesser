import type { GameEnd } from "../types/types";

const MEDAL = ["🥇", "🥈", "🥉"];

export default function GameOverScreen({
  result,
  onPlayAgain,
}: {
  result: GameEnd;
  onPlayAgain: () => void;
}) {
  const sortedScores = Object.entries(result.scores).sort(([, a], [, b]) => b - a);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Decorative top bar */}
        <div className="h-1.5 w-full bg-linear-to-r from-cyan-400 via-blue-500 to-cyan-300" />

        <div className="px-8 py-10 text-center">
          {/* Trophy / tie indicator */}
          <div className="mb-4 text-6xl">
            {result.isTie ? "🤝" : "🏆"}
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Game Over
          </p>

          {result.isTie ? (
            <>
              <h2 className="text-3xl font-bold text-white mt-1">It's a Tie!</h2>
              <p className="mt-2 text-slate-400 text-sm">
                Multiple players tied with {result.topScore} point{result.topScore !== 1 ? "s" : ""}
              </p>
            </>
          ) : result.winner ? (
            <>
              <h2 className="text-3xl font-bold text-white mt-1">{result.winner} wins!</h2>
              <p className="mt-2 text-slate-400 text-sm">
                {result.topScore} point{result.topScore !== 1 ? "s" : ""} scored
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-white mt-1">Nobody scored!</h2>
              <p className="mt-2 text-slate-400 text-sm">Better luck next time</p>
            </>
          )}

          {/* Scoreboard */}
          {sortedScores.length > 0 && (
            <div className="mt-8 rounded-xl border border-slate-700 bg-slate-800/60 divide-y divide-slate-700/60">
              {sortedScores.map(([name, score], i) => (
                <div
                  key={name}
                  className={`flex items-center justify-between px-5 py-3 ${
                    i === 0 ? "bg-cyan-500/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg w-6 text-center">
                      {MEDAL[i] ?? `${i + 1}.`}
                    </span>
                    <span className={`font-medium ${i === 0 ? "text-white" : "text-slate-300"}`}>
                      {name}
                    </span>
                  </div>
                  <span className={`tabular-nums font-bold text-lg ${i === 0 ? "text-cyan-400" : "text-slate-400"}`}>
                    {score}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={onPlayAgain}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 px-6 py-3 font-semibold text-white transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}