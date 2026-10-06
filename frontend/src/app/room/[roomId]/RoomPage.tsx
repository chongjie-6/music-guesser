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
import RoundPanel from "../../../components/RoundPanel";
import RoundResults from "../../../components/RoundResults";
import SettingsPanel from "../../../components/SettingsPanel";
import PlayersPanel from "../../../components/PlayersPanel";
import Star from "../../../components/Star";

// Phones get the share sheet; on desktop the clipboard is less hassle than the share dialog
const canShare = !!navigator.share && matchMedia("(pointer: coarse)").matches;

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { error, joinError, me, room, round, reveal, roundBreak, gameEnd, deadline, resetGame } =
    useGameEvents(roomId, audioRef);

  useJoinRoom(roomId);
  useNewMessageSocket(setMessages);

  const [copied, setCopied] = useState("");
  const copy = (what: string, text: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(what);
      setTimeout(() => setCopied(""), 1500);
    });
  };
  // Both labels share one grid cell so the button keeps the wider one's width.
  const copyLabel = (what: string, idle: string) => (
    <span className="grid">
      <span className={`col-start-1 row-start-1 ${copied === what ? "invisible" : ""}`}>{idle}</span>
      <span className={`col-start-1 row-start-1 ${copied === what ? "" : "invisible"}`}>Copied!</span>
    </span>
  );
  const invite = () => {
    const url = window.location.href;
    if (canShare) navigator.share({ text: "Join my Beat The Drop room", url }).catch(() => {});
    else copy("link", url);
  };

  const player = room?.players.find((p) => p.id === me);
  const isHost = !!room && room.hostId === me;
  const home = room?.kind === "party" ? "/play-with-friends" : "/";

  return (
    <>
      {joinError && (
        <RoomNotFoundModal message={joinError} onGoBack={() => navigate("/play-with-friends")} />
      )}
      {gameEnd && !joinError && (
        <GameOverScreen
          result={gameEnd}
          onClose={gameEnd.daily ? () => navigate("/") : resetGame}
          closeLabel={gameEnd.daily ? "◀ BACK HOME" : "▶ BACK TO LOBBY"}
        />
      )}
      {/* The last round goes straight to the game over screen */}
      {roundBreak && room && round && reveal && round.round < round.totalRounds && (
        <RoundResults key={round.round} room={room} round={round} reveal={reveal} me={me} />
      )}
      <main className="relative min-h-dvh bg-pixel-grid overflow-hidden">
        {/* Top marquee */}
        <div className="marquee-wrap marquee-fast sticky top-0 z-10">
          <InfiniteLooper
            speed={18}
            direction={"left"}
            items={[
              "BEAT THE DROP",
              "ROUND IN PROGRESS",
              "GUESS THE TRACK",
              "BEAT THE DROP",
            ]}
          />
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 pt-4 pb-48 lg:pb-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Chat panel */}
          <div>
            {error && (
              <div className="pixel-box-red p-3 mb-3 font-display text-sm glow-red">
                ⚠ {error}
              </div>
            )}
            <ChatMessages
              messages={messages}
              roomId={roomId}
              placeholder={round?.solved && room?.running ? "CHAT WITH WHO GOT IT_" : undefined}
            />
          </div>

          {/* Sidebar */}
          <aside className="order-first flex flex-col gap-3 lg:order-0">
            {/* Mid-game on phones these push the round below the fold */}
            {room?.kind === "party" && (
              <div
                className={`border-2 border-yellow-400/30 bg-cab-dark p-3 ${room.running ? "hidden lg:block" : ""}`}
              >
                <p className="font-display text-sm text-yellow-600/60 uppercase tracking-widest mb-1">
                  ROOM CODE
                </p>
                <p className="font-display text-sm glow-yellow mb-2 wrap-anywhere">{roomId}</p>
                <div className="flex flex-wrap gap-2" aria-live="polite">
                  <button onClick={() => copy("code", roomId ?? "")} className="btn btn-cyan text-xs">
                    {copyLabel("code", "Copy code")}
                  </button>
                  <button onClick={invite} className="btn btn-cyan text-xs">
                    {canShare ? "Share invite link" : copyLabel("link", "Copy invite link")}
                  </button>
                </div>
              </div>
            )}
            {room && room.kind !== "party" && (
              <div
                className={`border-2 border-yellow-400/30 bg-cab-dark p-3 ${room.running ? "hidden lg:block" : ""}`}
              >
                <p className="font-display text-sm glow-yellow uppercase tracking-widest">
                  {room.kind === "daily" ? `DAILY CHALLENGE · ${room.dailyDate}` : "SOLO PRACTICE"}
                </p>
                {room.kind === "daily" && (
                  <p className="font-body text-lg text-yellow-200/60 mt-1">
                    {room.settings.rounds} SONGS. SAME FOR EVERYONE TODAY.
                  </p>
                )}
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {room && !room.running && isHost && <StartGameButton roomID={roomId} />}
              {room && !room.running && !isHost && (
                <p className="font-display text-xs text-yellow-600/60 blink">WAITING FOR HOST...</p>
              )}
              {room?.running && !round && (
                <p className="font-display text-xs glow-cyan blink">LOADING TRACKS...</p>
              )}
              <button onClick={() => navigate(home)} className="btn btn-red text-sm">
                ✕ LEAVE
              </button>
            </div>

            {player?.spectator && (
              <p className="pixel-box-magenta p-3 font-body text-lg glow-magenta">
                ROOM'S FULL, SO YOU'RE SPECTATING. YOU'LL GET A SEAT IN THE NEXT GAME IF ONE
                FREES UP.
              </p>
            )}

            {room && !room.running && room.kind !== "daily" && (
              <SettingsPanel room={room} isHost={isHost} />
            )}

            {round && roomId && (
              <RoundPanel
                roomId={roomId}
                round={round}
                deadline={deadline}
                audioRef={audioRef}
                canPlay={!!player && !player.spectator}
              />
            )}

            {reveal && (
              <div className="pixel-box-magenta flex items-center gap-3 p-3">
                {reveal.artwork && (
                  <img src={reveal.artwork} alt="" className="h-16 w-16 shrink-0" />
                )}
                <div className="min-w-0 font-display text-xs leading-relaxed wrap-anywhere">
                  <p className="glow-magenta">{reveal.answer}</p>
                  <p className="text-cyan-200/70">{reveal.artist}</p>
                  {reveal.guessers.length === 0 && <p className="glow-red">NOBODY GOT IT!</p>}
                  {reveal.guessers.map((g) => (
                    <p key={g.id} className="glow-green">
                      <Star className="inline align-[0.09em]" /> {g.name.toUpperCase()} +{g.points}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {room && <PlayersPanel room={room} me={me} isHost={isHost} />}
          </aside>
        </div>

        <div className="absolute bottom-0 left-0 right-0 pixel-rule-rainbow" />
      </main>
    </>
  );
}
