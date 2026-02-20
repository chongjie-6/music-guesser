import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChatMessages from "../../../components/chatComponents/ChatMessagesList";
import type { GameRound, Message, ScoreBoard } from "../../../types/types";
import { useNewMessageSocket } from "../../../hooks/useNewMessageSocket";
import { socket } from "../../../socket";
import { useErrorSocket } from "../../../hooks/useErrorSocket";
import { StartGameButton } from "../../../components/buttons/StartGameButton";
import UserNameForm from "../../../components/UserNameForm";

export default function RoomPage() {
  const { roomId } = useParams();
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
        setLastWinnerMessage(`${winner} guessed correctly! The answer was ${answer}.`);
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
    <div className="flex w-screen justify-center gap-4 p-4">
      <div>
        {error && <div>{error}</div>}
        <ChatMessages messages={messages} roomId={roomId} />
      </div>

      <div className="max-w-sm bg-white text-black rounded-lg p-3 space-y-2">
        <StartGameButton roomID={roomId} />
        <UserNameForm />

        {round && (
          <>
            <h2 className="font-semibold">Round {round.round}</h2>
            <p>Artist: {round.artistName}</p>
            <p>Genre: {round.primaryGenreName}</p>
            <p>Release: {new Date(round.releaseDate).getFullYear()}</p>
            <audio controls src={round.previewUrl} className="w-full" />
          </>
        )}

        {lastWinnerMessage && <p className="text-green-700">{lastWinnerMessage}</p>}

        <div>
          <h3 className="font-semibold">Scoreboard</h3>
          {Object.keys(scores).length === 0 && <p>No scores yet</p>}
          {Object.entries(scores).map(([name, score]) => (
            <p key={name}>
              {name}: {score}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
