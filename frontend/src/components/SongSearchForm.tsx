import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../api/client";
import type { Album } from "../types/types";
import { useDebouncedCallback } from "use-debounce";
import { useState } from "react";

export default function SongSearchBar() {
  const [query, setQuery] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const debouncedQuery = useDebouncedCallback(() => {
    setQuery(queryInput);
  }, 300);

  const {
    data: albums,
    error,
    isLoading,
  } = useQuery<Album[]>({
    queryKey: ["albums", query],
    queryFn: () => apiGet(`/albums`, { query, limit: "4", songsPerAlbum: "5" }),
    enabled: query.length > 0,
  });

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Album search</h2>
        <div className="mt-4 flex w-full max-w-2xl flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="Search artist or album"
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

      {isLoading && <div className="py-6 text-center text-slate-500">Loading albums...</div>}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-center text-rose-700">
          Error fetching albums.
        </div>
      )}

      {albums && albums.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {albums.map((album) => (
            <article
              key={album.collectionId}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="mb-3 flex gap-3">
                <img
                  src={album.artworkUrl100}
                  alt={`${album.collectionName} artwork`}
                  className="h-24 w-24 rounded-md"
                />
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{album.collectionName}</h3>
                  <p className="text-sm text-slate-600">{album.artistName}</p>
                  <p className="text-xs text-slate-500">
                    {album.primaryGenreName} • {new Date(album.releaseDate).getFullYear()} • {album.trackCount} tracks
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {album.songs.map((song) => (
                  <div key={song.trackId} className="rounded-md border border-slate-200 bg-slate-50 p-2">
                    <p className="text-sm font-medium text-slate-800">
                      {song.trackNumber ? `${song.trackNumber}. ` : ""}
                      {song.trackName}
                    </p>
                    {song.previewUrl && <audio controls src={song.previewUrl} className="mt-1 w-full" />}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      {albums && albums.length === 0 && (
        <div className="py-8 text-center text-slate-500">No albums found.</div>
      )}
    </>
  );
}
