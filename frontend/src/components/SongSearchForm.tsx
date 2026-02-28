import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../api/client";
import type { Album } from "../types/types";
import { useDebouncedCallback } from "use-debounce";
import { useState } from "react";

export default function SongSearchBar() {
  const [query, setQuery] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const debouncedQuery = useDebouncedCallback(() => setQuery(queryInput), 300);

  const { data: albums, error, isLoading } = useQuery<Album[]>({
    queryKey: ["albums", query],
    queryFn: () => apiGet(`/albums`, { query, limit: "4", songsPerAlbum: "5" }),
    enabled: query.length > 0,
  });

  return (
    <>
      <div className="mb-8">
        <h2 className="font-display text-xl font-bold uppercase tracking-widest glow-cyan">◈ Album Search</h2>
        <div className="mt-4 flex w-full max-w-2xl flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="Search artist or album..."
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && debouncedQuery()}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-cyan-100 tracking-wide placeholder:text-slate-600 transition-all"
          />
          <button type="button" onClick={() => debouncedQuery()} className="btn btn-cyan px-6 py-3">
            Search
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="py-8 text-center font-display text-sm uppercase tracking-widest glow-cyan">◈ Loading...</div>
      )}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-4 text-center font-display text-sm uppercase tracking-wider glow-red">
          ⚠ Error fetching albums.
        </div>
      )}

      {albums && albums.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {albums.map((album) => (
            <article key={album.collectionId}
              className="brackets brackets-bottom relative rounded-xl p-4 transition-all hover:scale-[1.01] card-cyan">
              <div className="mb-3 flex gap-4">
                <img
                  src={album.artworkUrl100}
                  alt={`${album.collectionName} artwork`}
                  className="h-20 w-20 rounded-md album-img-glow"
                />
                <div>
                  <h3 className="font-display text-sm font-bold uppercase tracking-wide text-cyan-200">{album.collectionName}</h3>
                  <p className="text-sm text-fuchsia-300 mt-0.5">{album.artistName}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {album.primaryGenreName} · {new Date(album.releaseDate).getFullYear()} · {album.trackCount} tracks
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {album.songs.map((song) => (
                  <div key={song.trackId}
                    className="rounded-md p-2 border border-fuchsia-500/10 bg-fuchsia-500/3">
                    <p className="text-sm text-slate-300">
                      {song.trackNumber && <span className="text-fuchsia-500 font-display text-xs mr-1">{song.trackNumber}.</span>}
                      {song.trackName}
                    </p>
                    {song.previewUrl && <audio controls src={song.previewUrl} className="mt-1.5 w-full" />}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      {albums && albums.length === 0 && (
        <div className="py-10 text-center font-display text-sm uppercase tracking-widest text-slate-500">No results found.</div>
      )}
    </>
  );
}