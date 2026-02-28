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
    if (roomId) { setRoomNotFound(false); setError(""); socket.emit("join-room", roomId); }
  }, [roomId]);

  useEffect(() => {
    socket.on("error", (message: string) => {
      if (message === "Room does not exist") setRoomNotFound(true); else setError(message);
    });
    socket.on("game-started", (payload: GameRound) => { setRound(payload); setScores(payload.scores || {}); setLastWinnerMessage(""); setGameEnd(null); });
    socket.on("game-next-round", (payload: GameRound) => { setRound(payload); setScores(payload.scores || {}); });
    socket.on("game-correct-guess", ({ winner, answer }: { winner: string; answer: string }) => {
      setLastWinnerMessage(`${winner} GUESSED IT! ANSWER: ${answer}`);
    });
    socket.on("skipped-round", (payload: GameRound & { answer?: string }) => {
      setLastWinnerMessage(payload.answer ? `TIME OUT! ANSWER: ${payload.answer}` : "NOBODY GUESSED IN TIME...");
      if (payload.round) { setRound(payload); setScores(payload.scores || {}); }
    });
    socket.on("game-end", (result: GameEnd) => { setGameEnd(result); setScores(result.scores || {}); });
    return () => {
      socket.off("error"); socket.off("game-started"); socket.off("game-next-round");
      socket.off("game-correct-guess"); socket.off("game-end"); socket.off("skipped-round");
    };
  }, []);

  useNewMessageSocket(setMessages);

  return (
    <>
      {roomNotFound && <RoomNotFoundModal onGoBack={() => navigate("/play-with-friends")} />}
      {gameEnd && <GameOverScreen result={gameEnd} onPlayAgain={() => { setGameEnd(null); setRound(null); setScores({}); setLastWinnerMessage(""); }} />}

      <main className="relative min-h-screen bg-pixel-grid overflow-hidden">
        {/* Top marquee */}
        <div className="marquee-wrap sticky top-0 z-10">
          <div className="marquee-inner">
            ★ BEAT THE DROP ★ ROUND IN PROGRESS ★ GUESS THE TRACK ★ BEAT THE DROP ★&nbsp;
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[1fr_300px]">

          {/* Chat panel */}
          <div>
            {error && (
              <div className="pixel-box-red p-3 mb-3 font-display text-[9px] glow-red">
                ⚠ {error}
              </div>
            )}
            <ChatMessages messages={messages} roomId={roomId} />
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-3">
            {/* Room ID */}
            <div className="border-2 border-yellow-400/30 bg-cab-dark p-3">
              <p className="font-display text-[8px] text-yellow-600/60 uppercase tracking-widest mb-1">ROOM CODE</p>
              <p className="font-display text-[9px] glow-yellow truncate">{roomId}</p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-2">
              <StartGameButton roomID={roomId} />
              {roomId && <LeaveRoomButton socket={socket} roomID={roomId} />}
              <button onClick={() => navigate("/play-with-friends")} className="btn btn-yellow text-[8px]">
                ← BACK
              </button>
            </div>

            {/* Round info */}
            {round && (
              <div className="pixel-box-cyan p-4">
                <div className="pixel-rule-cyan mb-3" />
                <p className="font-display text-[8px] glow-cyan uppercase tracking-widest mb-3">
                  — ROUND {round.round} / 10 —
                </p>
                <div className="font-body text-xl space-y-1 text-cyan-200/80">
                  <p>ARTIST: <span className="glow-magenta">{round.artistName}</span></p>
                  <p>GENRE: <span className="glow-magenta">{round.primaryGenreName}</span></p>
                  <p>YEAR: <span className="glow-magenta">{new Date(round.releaseDate).getFullYear()}</span></p>
                </div>
                <audio controls src={round.previewUrl} className="mt-3 w-full" autoPlay />
                <div className="pixel-rule-cyan mt-3" />
              </div>
            )}

            {/* Winner flash */}
            {lastWinnerMessage && (
              <div className="pixel-box-magenta p-3 font-display text-[8px] glow-magenta leading-relaxed blink">
                ★ {lastWinnerMessage}
              </div>
            )}

            {/* Scoreboard */}
            {Object.keys(scores).length > 0 && (
              <div className="pixel-box p-4">
                <div className="pixel-rule-rainbow mb-3" />
                <p className="font-display text-[9px] glow-yellow mb-3 tracking-widest">
                  HI-SCORE TABLE
                </p>
                <ul className="flex flex-col gap-1.5">
                  {Object.entries(scores)
                    .sort(([, a], [, b]) => b - a)
                    .map(([player, score], i) => (
                      <li key={player}
                        className={`flex justify-between items-center px-3 py-2 font-display text-[8px] ${
                          i === 0 ? "score-row-top glow-yellow"
                          : i === 1 ? "score-row-2 glow-cyan"
                          : i === 2 ? "score-row-3 glow-magenta"
                          : "score-row-dim text-yellow-200/40"
                        }`}>
                        <span>{i + 1}. {player.toUpperCase()}</span>
                        <span>{score} PTS</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        <div className="absolute bottom-0 left-0 right-0 pixel-rule-rainbow" />
      </main>
    </>
  );
}