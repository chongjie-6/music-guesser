import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatMessages from "../../../components/chatComponents/ChatMessagesList";
import type { Message } from "../../../types/types";
import { useNewMessageSocket } from "../../../hooks/useNewMessageSocket";
import { useJoinRoom } from "../../../hooks/useJoinRoom";
import { useGameEvents } from "../../../hooks/useGameEvents";
import { StartGameButton } from "../../../components/buttons/StartGameButton";
import GameOverScreen from "../../../components/GameOverScreen";
import RoomNotFoundModal from "../../../components/RoomNotFound";
import InfiniteLooper from "../../../components/InfiniteLooper";
import MusicPlayer from "../../../components/MusicPlayer";
import Countdown from "../../../components/Countdown";

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    error,
    roomNotFound,
    round,
    scores,
    lastWinnerMessage,
    gameEnd,
    musicStopped,
    deadline,
    resetGame,
  } = useGameEvents(roomId, audioRef);

  useJoinRoom(roomId);
  useNewMessageSocket(setMessages);

  const [copied, setCopied] = useState(false);

  const copyToClipboard = (roomId: string | undefined) => {
    if (!roomId) return;
    navigator.clipboard?.writeText(roomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <>
      {roomNotFound && (
        <RoomNotFoundModal onGoBack={() => navigate("/play-with-friends")} />
      )}
      {gameEnd && (
        <GameOverScreen
          result={gameEnd}
          onPlayAgain={resetGame}
        />
      )}

      <main className="relative min-h-screen bg-pixel-grid overflow-hidden">
        {/* Top marquee */}
        <div className="marquee-wrap marquee-fast sticky top-0 z-10">
          <InfiniteLooper speed={18} direction={"left"}>
            {" "}
            ★ BEAT THE DROP ★ ROUND IN PROGRESS ★ GUESS THE TRACK ★ BEAT THE
            DROP&nbsp;{" "}
          </InfiniteLooper>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 pt-4 pb-24 lg:pb-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Chat panel */}
          <div>
            {error && (
              <div className="pixel-box-red p-3 mb-3 font-display text-sm glow-red">
                ⚠ {error}
              </div>
            )}
            <ChatMessages messages={messages} roomId={roomId} />
          </div>

          {/* Sidebar */}
          <aside className="order-first flex flex-col gap-3 lg:order-0">
            {/* Room ID */}
            <div className="border-2 border-yellow-400/30 bg-cab-dark p-3">
              <p className="font-display text-sm text-yellow-600/60 uppercase tracking-widest mb-1">
                ROOM CODE
              </p>
              <div>
                <p className="font-display text-sm glow-yellow">{roomId}</p>
                <button
                  onClick={() => copyToClipboard(roomId)}
                  className="btn btn-cyan text-xs"
                  aria-live="polite"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-2">
              <StartGameButton roomID={roomId} />
              <button
                onClick={() => navigate("/play-with-friends")}
                className="btn btn-red text-sm"
              >
                ✕ LEAVE
              </button>
            </div>

            {/* Round info */}
            {round && (
              <div className="pixel-box-cyan p-4">
                <div className="pixel-rule-cyan mb-3" />
                <p className="font-display text-sm glow-cyan uppercase tracking-widest mb-3">
                  — ROUND {round.round} / 10 —
                </p>
                {deadline !== null && (
                  <p
                    className={`font-display text-sm mb-3 ${musicStopped ? "glow-red" : "glow-yellow"}`}
                  >
                    {musicStopped ? "MUSIC STOPPED · " : "⏱ "}
                    {/* Remount per deadline so the first render isn't a stale tick */}
                    <Countdown key={deadline} deadline={deadline} />s LEFT
                  </p>
                )}
                <div className="font-body text-xl space-y-1 text-cyan-200/80">
                  <p>
                    ARTIST:{" "}
                    <span className="glow-magenta">{round.artistName}</span>
                  </p>
                  <p>
                    GENRE:{" "}
                    <span className="glow-magenta">
                      {round.primaryGenreName}
                    </span>
                  </p>
                  <p>
                    YEAR:{" "}
                    <span className="glow-magenta">
                      {round.releaseDate?.slice(0, 4) ?? "?"}
                    </span>
                  </p>
                </div>
                <MusicPlayer
                  src={round.previewUrl}
                  audioRef={audioRef}
                  stopped={musicStopped}
                />
                <div className="pixel-rule-cyan mt-3" />
              </div>
            )}

            {/* Winner flash */}
            {lastWinnerMessage && (
              <div className="pixel-box-magenta p-3 font-display text-sm glow-magenta leading-relaxed blink">
                ★ {lastWinnerMessage}
              </div>
            )}

            {/* Scoreboard */}
            {scores.length > 0 && (
              <div className="pixel-box p-4">
                <div className="pixel-rule-rainbow mb-3" />
                <p className="font-display text-sm glow-yellow mb-3 tracking-widest">
                  HI-SCORE TABLE
                </p>
                <ul className="flex flex-col gap-1.5">
                  {scores.map(({ id, name, score }, i) => (
                    <li
                      key={id}
                      className={`flex justify-between items-center gap-3 px-3 py-2 font-display text-sm ${
                        i === 0
                          ? "score-row-top glow-yellow"
                          : i === 1
                            ? "score-row-2 glow-cyan"
                            : i === 2
                              ? "score-row-3 glow-magenta"
                              : "score-row-dim text-yellow-200/40"
                      }`}
                    >
                      <span className="wrap-anywhere">
                        {i + 1}. {name.toUpperCase()}
                      </span>
                      <span className="shrink-0">{score} PTS</span>
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
