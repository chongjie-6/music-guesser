import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../api/client";
import type { Song } from "../types/types";
import { useDebouncedCallback } from "use-debounce";
import { useState } from "react";

export default function SongSearchBar() {
  const [query, setQuery] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const debouncedQuery = useDebouncedCallback(() => {
    setQuery(queryInput);
  }, 300);

  const {
    data: currentSongs,
    error,
    isLoading,
  } = useQuery<Song[]>({
    queryKey: [query],
    queryFn: () => apiGet(`/songs`, { query, limit: "5" }),
    enabled: query.length > 0,
  });

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Song search</h2>
        <div className="mt-4 flex w-full max-w-2xl flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="Search artist or song"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && debouncedQuery()}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none ring-slate-400 placeholder:text-slate-400 focus:ring-2"
          />
          <button
            type="button"
            onClick={() => debouncedQuery()}
            className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Search
          </button>
        </div>
      </div>

      {isLoading && <div className="py-6 text-center text-slate-500">Loading tracks...</div>}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-center text-rose-700">
          Error fetching songs.
        </div>
      )}

      {currentSongs && currentSongs.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {currentSongs.map((song) => (
            <article
              key={`${song.trackName}-${song.artistId}`}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <img
                src={song?.artworkUrl100}
                alt={`${song.trackName} artwork`}
                className="mb-3 w-full rounded-md"
              />
              <h3 className="line-clamp-2 text-base font-semibold text-slate-900">{song.trackName}</h3>
              <p className="mb-3 text-sm text-slate-600">{song.artistName}</p>
              <audio controls src={song?.previewUrl} className="w-full" />
            </article>
          ))}
        </div>
      )}

      {currentSongs && currentSongs.length === 0 && (
        <div className="py-8 text-center text-slate-500">No songs found.</div>
      )}
    </>
  );
}
