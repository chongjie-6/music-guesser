import type { GameEnd } from "../types/types";

const MEDAL = ["🥇", "🥈", "🥉"];

export default function GameOverScreen({ result, onPlayAgain }: { result: GameEnd; onPlayAgain: () => void }) {
  const sortedScores = Object.entries(result.scores).sort(([, a], [, b]) => b - a);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-space-950/90">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-96 w-96 rounded-full bg-cyan-500/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md mx-4 overflow-hidden rounded-2xl card-cyan">
        <div className="divider-cyan w-full" />
        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-neon-cyan" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-neon-cyan" />

        <div className="px-8 py-10 text-center">
          <div className="mb-4 text-5xl drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]">
            {result.isTie ? "🤝" : "🏆"}
          </div>

          <p className="font-display text-xs font-bold uppercase tracking-[0.4em] glow-cyan mb-2">
            ◈ Game Over ◈
          </p>

          {result.isTie ? (
            <>
              <h2 className="font-display text-3xl font-black uppercase glow-magenta">It's a Tie!</h2>
              <p className="mt-2 text-slate-400 text-sm">{result.topScore} point{result.topScore !== 1 ? "s" : ""} each</p>
            </>
          ) : result.winner ? (
            <>
              <h2 className="font-display text-3xl font-black uppercase text-gradient-winner">{result.winner}</h2>
              <p className="font-display text-sm glow-cyan mt-1 uppercase tracking-widest">
                Wins with {result.topScore} pts
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display text-3xl font-black text-slate-400 uppercase">Nobody Scored</h2>
              <p className="mt-2 text-slate-500 text-sm">Better luck next time</p>
            </>
          )}

          {sortedScores.length > 0 && (
            <div className="mt-8 rounded-xl overflow-hidden border border-cyan-500/10">
              {sortedScores.map(([name, score], i) => (
                <div key={name}
                  className={`flex items-center justify-between px-5 py-3 ${i === 0 ? "row-highlight-cyan" : "row-dim"} ${i < sortedScores.length - 1 ? "border-b border-cyan-500/6" : ""}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg w-6 text-center">{MEDAL[i] ?? `${i + 1}.`}</span>
                    <span className={`font-display text-sm uppercase tracking-wider ${i === 0 ? "text-cyan-300" : "text-slate-400"}`}>{name}</span>
                  </div>
                  <span className={`font-display font-bold text-lg tabular-nums ${i === 0 ? "glow-cyan" : "text-slate-500"}`}>{score}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8">
            <button onClick={onPlayAgain} className="btn btn-cyan w-full py-3 text-sm">
              ▶ Play Again
            </button>
          </div>
        </div>
        <div className="divider-magenta w-full" />
      </div>
    </div>
  );
}