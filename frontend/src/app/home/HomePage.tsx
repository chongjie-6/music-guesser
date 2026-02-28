import PlayWithFriendsButton from "../../components/buttons/PlayWithFriendsButton";
import InfiniteLooper from "../../components/InfiniteLooper";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-pixel-grid px-4 py-10">
      {/* Cabinet marquee strip */}
      <div className="absolute top-0 left-0 right-0 marquee-wrap">
        <InfiniteLooper speed={6} direction={"left"}>
          {" "}
          ★ BEAT THE DROP ★ ROUND IN PROGRESS ★ GUESS THE TRACK ★ BEAT THE DROP
          &nbsp;{" "}
        </InfiniteLooper>
      </div>

      {/* Screen glow orb */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-yellow-300/5 blur-3xl" />
      </div>

      <div className="pixel-box relative w-full max-w-xl p-8 mt-12">
        {/* Pixel rule top */}
        <div className="pixel-rule-rainbow mb-6" />

        <p className="font-display text-sm tracking-[.25em] uppercase glow-cyan blink mb-4">
          ▼ PLAYER 1 — PRESS START ▼
        </p>

        <h1 className="font-display text-4xl leading-tight uppercase glow-pulse mb-2">
          <span className="text-rainbow">BEAT</span>
        </h1>
        <h1 className="font-display text-4xl leading-tight uppercase glow-yellow mb-6">
          THE DROP
        </h1>

        <p className="font-body text-2xl text-yellow-200/70 mb-8 leading-relaxed">
          JAM WITH FRIENDS. GUESS THE TRACK.
          <br />
          DOMINATE THE SCOREBOARD.
        </p>

        <div className="flex justify-start">
          <PlayWithFriendsButton />
        </div>

        <div className="pixel-rule-yellow mt-8" />
        <p className="font-display text-sm glow-yellow/40 text-yellow-500/40 mt-3 tracking-widest">
          © 1984 BEAT THE DROP ARCADE CO.
        </p>
      </div>

      {/* Bottom rainbow rule */}
      <div className="absolute bottom-0 left-0 right-0 pixel-rule-rainbow" />
    </main>
  );
}
