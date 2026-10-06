import { useEffect, useState, type RefObject } from "react";
import { socket } from "../socket";
import type { GameEnd, GameRound, Hints, Reveal, RoomState, Solved } from "../types/types";

export function useGameEvents(
  roomId: string | undefined,
  audioRef: RefObject<HTMLAudioElement | null>,
) {
  const [error, setError] = useState<string>("");
  const [joinError, setJoinError] = useState<string>("");
  const [me, setMe] = useState<string>("");
  const [room, setRoom] = useState<RoomState | null>(null);
  const [round, setRound] = useState<GameRound | null>(null);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [gameEnd, setGameEnd] = useState<GameEnd | null>(null);
  const [deadline, setDeadline] = useState<number | null>(null);

  useEffect(() => {
    setJoinError("");
    setError("");
    setRoom(null);
    setRound(null);
    setReveal(null);
    setGameEnd(null);
  }, [roomId]);

  useEffect(() => {
    socket.on("error", (message: string) => setError(message));
    socket.on("join-error", (message: string) => setJoinError(message));
    socket.on("joined", ({ playerId }: { playerId: string }) => setMe(playerId));
    socket.on("room-state", (state: RoomState) => setRoom(state));
    socket.on("game-started", () => {
      setRound(null);
      setReveal(null);
      setGameEnd(null);
      setError("");
    });
    socket.on("game-round", (payload: GameRound) => {
      setRound(payload);
      setDeadline(Date.now() + payload.timeLeftMs);
    });
    socket.on("game-hint", (update: { stage: number; hints: Hints }) => {
      setRound((r) => r && { ...r, ...update });
    });
    socket.on("game-music-stop", ({ timeLeftMs }: { timeLeftMs: number }) => {
      setRound((r) => r && { ...r, musicStopped: true });
      setDeadline(Date.now() + timeLeftMs);
      audioRef.current?.pause();
    });
    socket.on("pick-result", ({ index }: { index: number }) => {
      setRound((r) => r && { ...r, picked: index });
    });
    socket.on("guess-result", (solved: Solved) => {
      setRound((r) => r && { ...r, solved });
    });
    socket.on("round-end", (payload: Reveal) => setReveal(payload));
    socket.on("game-end", (result: GameEnd) => {
      setGameEnd(result);
      setDeadline(null);
      audioRef.current?.pause();
    });

    return () => {
      for (const event of [
        "error",
        "join-error",
        "joined",
        "room-state",
        "game-started",
        "game-round",
        "game-hint",
        "game-music-stop",
        "pick-result",
        "guess-result",
        "round-end",
        "game-end",
      ]) {
        socket.off(event);
      }
    };
  }, [audioRef]);

  const resetGame = () => {
    setGameEnd(null);
    setRound(null);
    setReveal(null);
  };

  return { error, joinError, me, room, round, reveal, gameEnd, deadline, resetGame };
}
