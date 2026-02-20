import PlayWithFriendsButton from "../../components/buttons/PlayWithFriendsButton";
import SongSearchForm from "../../components/SongSearchForm";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-8">
        <p className="text-sm text-slate-500">Music Guesser</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Simple music guessing with friends.</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Search for songs, preview tracks, and play rounds together in a shared room.
        </p>
        <div className="mt-6">
          <PlayWithFriendsButton />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <SongSearchForm />
      </section>
    </main>
  );
}
