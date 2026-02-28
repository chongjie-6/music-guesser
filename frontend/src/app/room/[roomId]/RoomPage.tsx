import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatMessages from "../../../components/chatComponents/ChatMessagesList";
import type { GameEnd, GameRound, Message, ScoreBoard } from "../../../types/types";
import { useNewMessageSocket } from "../../../hooks/useNewMessageSocket";
import { socket } from "../../../socket";
import { StartGameButton } from "../../../components/buttons/StartGameButton";
import { LeaveRoomButton } from "../../../components/buttons/LeaveRoomButton";
import GameOverScreen from "../../../components/GameOverScreen";
import RoomNotFoundModal from "../../../components/RoomNotFound";

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string>("");
  const [roomNotFound, setRoomNotFound] = useState(false);
  const [round, setRound] = useState<GameRound | null>(null);
  const [scores, setScores] = useState<ScoreBoard>({});
  const [lastWinnerMessage, setLastWinnerMessage] = useState<string>("");
  const [gameEnd, setGameEnd] = useState<GameEnd | null>(null);

  useEffect(() => {
    if (roomId) {
      setRoomNotFound(false);
      setError("");
      socket.emit("join-room", roomId);
    }
  }, [roomId]);

  useEffect(() => {
    socket.on("error", (message: string) => {
      if (message === "Room does not exist") setRoomNotFound(true);
      else setError(message);
    });
    socket.on("game-started", (payload: GameRound) => {
      setRound(payload); setScores(payload.scores || {}); setLastWinnerMessage(""); setGameEnd(null);
    });
    socket.on("game-next-round", (payload: GameRound) => {
      setRound(payload); setScores(payload.scores || {});
    });
    socket.on("game-correct-guess", ({ winner, answer }: { winner: string; answer: string }) => {
      setLastWinnerMessage(`${winner} guessed correctly. Answer: ${answer}.`);
    });
    socket.on("skipped-round", (payload: GameRound & { answer?: string }) => {
      setLastWinnerMessage(payload.answer ? `Nobody guessed it. Answer: ${payload.answer}` : "Nobody guessed that in time...");
      if (payload.round) { setRound(payload); setScores(payload.scores || {}); }
    });
    socket.on("game-end", (result: GameEnd) => { setGameEnd(result); setScores(result.scores || {}); });
    return () => {
      socket.off("error"); socket.off("game-started"); socket.off("game-next-round");
      socket.off("game-correct-guess"); socket.off("game-end"); socket.off("skipped-round");
    };
  }, []);

  useNewMessageSocket(setMessages);

  const handlePlayAgain = () => { setGameEnd(null); setRound(null); setScores({}); setLastWinnerMessage(""); };

  return (
    <>
      {roomNotFound && <RoomNotFoundModal onGoBack={() => navigate("/play-with-friends")} />}
      {gameEnd && <GameOverScreen result={gameEnd} onPlayAgain={handlePlayAgain} />}

      <main className="relative mx-auto grid min-h-screen w-full max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[2fr_1fr] overflow-hidden">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-grid-cyan opacity-60" />

        <div>
          {error && (
            <div className="mb-3 rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm glow-red">
              ⚠ {error}
            </div>
          )}
          <ChatMessages messages={messages} roomId={roomId} />
        </div>

        <aside className="h-fit rounded-xl p-4 card-cyan">
          {/* Room ID */}
          <div className="mb-4 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
            <p className="font-display text-xs text-slate-500 uppercase tracking-widest">Room ID</p>
            <p className="font-display text-xs glow-cyan truncate mt-0.5">{roomId}</p>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <StartGameButton roomID={roomId} />
            {roomId && <LeaveRoomButton socket={socket} roomID={roomId} />}
            <button
              onClick={() => navigate("/play-with-friends")}
              className="btn btn-ghost"
            >
              Back
            </button>
          </div>

          {round && (
            <section className="mt-4 rounded-lg border border-fuchsia-500/20 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-sm font-bold uppercase tracking-widest glow-magenta">
                  Round {round.round}
                </h2>
                <span className="font-display text-xs text-slate-500">/ 10</span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-slate-400">Artist: <span className="text-fuchsia-300">{round.artistName}</span></p>
                <p className="text-slate-400">Genre: <span className="text-fuchsia-300">{round.primaryGenreName}</span></p>
                <p className="text-slate-400">Year: <span className="text-fuchsia-300">{new Date(round.releaseDate).getFullYear()}</span></p>
              </div>
              <audio controls src={round.previewUrl} className="mt-3 w-full" autoPlay />
            </section>
          )}

          {lastWinnerMessage && (
            <p className="mt-3 rounded-lg border border-green-500/20 bg-green-900/10 p-2 text-xs font-display glow-green">
              ✓ {lastWinnerMessage}
            </p>
          )}

          {Object.keys(scores).length > 0 && (
            <section className="mt-4">
              <h3 className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.2em] glow-cyan">
                ▶ Scoreboard
              </h3>
              <ul className="space-y-1.5">
                {Object.entries(scores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([player, score], i) => (
                    <li key={player}
                      className={`flex justify-between items-center rounded-md px-3 py-2 text-sm ${i === 0 ? "row-highlight-cyan" : "row-dim"}`}>
                      <span className={i === 0 ? "text-cyan-300 font-semibold" : "text-slate-400"}>
                        {i === 0 ? "◆ " : `${i + 1}. `}{player}
                      </span>
                      <span className={`font-display font-bold tabular-nums ${i === 0 ? "glow-cyan" : "text-slate-500"}`}>
                        {score}
                      </span>
                    </li>
                  ))}
              </ul>
            </section>
          )}
        </aside>
      </main>
    </>
  );
}