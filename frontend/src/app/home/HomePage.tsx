import PlayWithFriendsButton from "../../components/buttons/PlayWithFriendsButton";

export default function HomePage() {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-8 px-4 py-10 overflow-hidden">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 bg-grid-cyan" />
      {/* Glow orbs */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <section className="brackets brackets-bottom relative w-full rounded-2xl p-10 text-center card-cyan">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] glow-cyan mb-4">
          Music Guesser
        </p>
        <h1 className="font-display mt-2 text-5xl font-black uppercase tracking-wider text-gradient-neon">
          Beat the Drop
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-lg text-blue-200/70">
          Jam with friends. Guess the track. Dominate the scoreboard.
        </p>
        <div className="mt-8 flex justify-center">
          <PlayWithFriendsButton />
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 divider-cyan" />
      </section>
    </main>
  );
}