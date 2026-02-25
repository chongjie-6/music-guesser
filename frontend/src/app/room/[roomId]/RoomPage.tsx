import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatMessages from "../../../components/chatComponents/ChatMessagesList";
import type {
  GameEnd,
  GameRound,
  Message,
  ScoreBoard,
} from "../../../types/types";
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
      if (message === "Room does not exist") {
        setRoomNotFound(true);
      } else {
        setError(message);
      }
    });

    socket.on("game-started", (payload: GameRound) => {
      setRound(payload);
      setScores(payload.scores || {});
      setLastWinnerMessage("");
      setGameEnd(null);
    });

    socket.on("game-next-round", (payload: GameRound) => {
      setRound(payload);
      setScores(payload.scores || {});
    });

    socket.on(
      "game-correct-guess",
      ({ winner, answer }: { winner: string; answer: string }) => {
        setLastWinnerMessage(`${winner} guessed correctly. Answer: ${answer}.`);
      },
    );

    socket.on("skipped-round", (payload: GameRound & { answer?: string }) => {
      if (payload.answer) {
        setLastWinnerMessage(`Nobody guessed it. Answer: ${payload.answer}`);
      } else {
        setLastWinnerMessage("Nobody guessed that in time...");
      }
      if (payload.round) {
        setRound(payload);
        setScores(payload.scores || {});
      }
    });

    socket.on("game-end", (result: GameEnd) => {
      setGameEnd(result);
      setScores(result.scores || {});
    });

    return () => {
      socket.off("error");
      socket.off("game-started");
      socket.off("game-next-round");
      socket.off("game-correct-guess");
      socket.off("game-end");
      socket.off("skipped-round");
    };
  }, []);

  useNewMessageSocket(setMessages);

  const handlePlayAgain = () => {
    setGameEnd(null);
    setRound(null);
    setScores({});
    setLastWinnerMessage("");
  };

  return (
    <>
      {roomNotFound && (
        <RoomNotFoundModal onGoBack={() => navigate("/play-with-friends")} />
      )}

      {gameEnd && (
        <GameOverScreen result={gameEnd} onPlayAgain={handlePlayAgain} />
      )}

      <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[2fr_1fr]">
        <div>
          {error && (
            <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          <ChatMessages messages={messages} roomId={roomId} />
        </div>

        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-4 text-slate-900">
          <div className="mb-4 flex flex-wrap gap-2">
            <StartGameButton roomID={roomId} />
            {roomId && <LeaveRoomButton socket={socket} roomID={roomId} />}
            <button
              onClick={() => navigate("/play-with-friends")}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
          </div>

          {round && (
            <section className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Round {round.round}</h2>
                <span className="text-xs text-slate-400">of 10</span>
              </div>
              <p className="text-sm text-slate-600">
                Artist: {round.artistName} <br></br>
                Genre: {round.primaryGenreName} <br></br>
                Released: {new Date(round.releaseDate).getFullYear()}
              </p>
              <audio
                controls
                src={round.previewUrl}
                className="mt-2 w-full"
                autoPlay={true}
              />
            </section>
          )}

          {lastWinnerMessage && (
            <p className="mt-3 text-sm text-slate-600">{lastWinnerMessage}</p>
          )}

          {Object.keys(scores).length > 0 && (
            <section className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">
                Scores
              </h3>
              <ul className="space-y-1">
                {Object.entries(scores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([player, score]) => (
                    <li
                      key={player}
                      className="flex justify-between text-sm text-slate-600"
                    >
                      <span>{player}</span>
                      <span className="font-medium">{score}</span>
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
