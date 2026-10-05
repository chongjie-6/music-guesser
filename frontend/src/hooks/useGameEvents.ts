import { useEffect, useState, type RefObject } from "react";
import { socket } from "../socket";
import type { GameEnd, GameRound, PlayerScore } from "../types/types";

export function useGameEvents(
  roomId: string | undefined,
  audioRef: RefObject<HTMLAudioElement | null>,
) {
  const [error, setError] = useState<string>("");
  const [roomNotFound, setRoomNotFound] = useState(false);
  const [round, setRound] = useState<GameRound | null>(null);
  const [scores, setScores] = useState<PlayerScore[]>([]);
  const [lastWinnerMessage, setLastWinnerMessage] = useState<string>("");
  const [gameEnd, setGameEnd] = useState<GameEnd | null>(null);

  useEffect(() => {
    setRoomNotFound(false);
    setError("");
  }, [roomId]);

  useEffect(() => {
    socket.on("error", (message: string) => {
      if (message === "Room does not exist") setRoomNotFound(true);
      else setError(message);
    });
    socket.on("game-started", (payload: GameRound) => {
      setRound(payload);
      setScores(payload.scores);
      setLastWinnerMessage("");
      setGameEnd(null);
      setError("");
    });
    socket.on("game-next-round", (payload: GameRound) => {
      setRound(payload);
      setScores(payload.scores);
      setError("");
    });
    socket.on(
      "game-correct-guess",
      ({ winner, answer }: { winner: string; answer: string }) => {
        setLastWinnerMessage(`${winner} GUESSED IT! ANSWER: ${answer}`);
      },
    );
    socket.on("skipped-round", ({ answer }: { answer: string }) => {
      setLastWinnerMessage(`TIME OUT! ANSWER: ${answer}`);
    });
    socket.on("game-end", (result: GameEnd) => {
      setGameEnd(result);
      setScores(result.scores);
      audioRef.current?.pause();
    });
    return () => {
      socket.off("error");
      socket.off("game-started");
      socket.off("game-next-round");
      socket.off("game-correct-guess");
      socket.off("game-end");
      socket.off("skipped-round");
    };
  }, [audioRef]);

  const resetGame = () => {
    setGameEnd(null);
    setRound(null);
    setScores([]);
    setLastWinnerMessage("");
  };

  return {
    error,
    roomNotFound,
    round,
    scores,
    lastWinnerMessage,
    gameEnd,
    resetGame,
  };
}
