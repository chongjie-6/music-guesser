import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatMessages from "../../../components/chatComponents/ChatMessagesList";
import type { GameRound, Message, ScoreBoard } from "../../../types/types";
import { useNewMessageSocket } from "../../../hooks/useNewMessageSocket";
import { socket } from "../../../socket";
import { useErrorSocket } from "../../../hooks/useErrorSocket";
import { StartGameButton } from "../../../components/buttons/StartGameButton";
import UserNameForm from "../../../components/UserNameForm";
import { LeaveRoomButton } from "../../../components/buttons/LeaveRoomButton";

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string>("");
  const [round, setRound] = useState<GameRound | null>(null);
  const [scores, setScores] = useState<ScoreBoard>({});
  const [lastWinnerMessage, setLastWinnerMessage] = useState<string>("");

  useEffect(() => {
    if (roomId) {
      socket.emit("join-room", roomId);
    }
  }, [roomId]);

  useEffect(() => {
    socket.on("game-started", (payload: GameRound) => {
      setRound(payload);
      setScores(payload.scores || {});
      setLastWinnerMessage("");
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

    return () => {
      socket.off("game-started");
      socket.off("game-next-round");
      socket.off("game-correct-guess");
    };
  }, []);

  useNewMessageSocket(setMessages);
  useErrorSocket(setError);

  return (
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

        <UserNameForm />

        {round && (
          <section className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <h2 className="font-semibold">Round {round.round}</h2>
            <p className="text-sm text-slate-600">Artist: {round.artistName}</p>
            <p className="text-sm text-slate-600">
              Genre: {round.primaryGenreName}
            </p>
            <p className="text-sm text-slate-600">
              Release: {new Date(round.releaseDate).getFullYear()}
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
          <p className="mt-4 text-sm text-emerald-700">{lastWinnerMessage}</p>
        )}

        <section className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <h3 className="font-medium">Scoreboard</h3>
          {Object.keys(scores).length === 0 && (
            <p className="text-sm text-slate-500">No scores yet</p>
          )}
          <div className="mt-2 space-y-1">
            {Object.entries(scores).map(([name, score]) => (
              <p key={name} className="text-sm text-slate-700">
                {name}: <span className="font-semibold">{score}</span>
              </p>
            ))}
          </div>
        </section>
      </aside>
    </main>
  );
}
