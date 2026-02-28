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
        <h2 className="font-display text-sm glow-cyan uppercase mb-4">▶ ALBUM SEARCH</h2>
        <div className="flex w-full max-w-2xl flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="SEARCH ARTIST OR ALBUM_"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && debouncedQuery()}
            className="flex-1 border-2 border-cyan-400/50 bg-cab-black px-4 py-3 text-cyan-200 tracking-wider placeholder:text-cyan-900/50"
          />
          <button type="button" onClick={() => debouncedQuery()} className="btn btn-cyan py-3 px-6">
            SEARCH
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="py-8 text-center font-display text-[9px] glow-cyan blink tracking-widest uppercase">
          ◈ LOADING...
        </div>
      )}
      {error && (
        <div className="pixel-box-red p-4 text-center font-display text-[9px] glow-red uppercase tracking-wider">
          ⚠ ERROR FETCHING ALBUMS
        </div>
      )}

      {albums && albums.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {albums.map((album) => (
            <article key={album.collectionId} className="pixel-box-cyan p-4 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]">
              <div className="mb-3 flex gap-4">
                <img
                  src={album.artworkUrl100}
                  alt={`${album.collectionName} artwork`}
                  className="h-20 w-20 border-2 border-cyan-400/40"
                  style={{ boxShadow: "3px 3px 0 rgba(0,245,255,.4)" }}
                />
                <div>
                  <h3 className="font-display text-[9px] glow-yellow uppercase leading-snug mb-1">{album.collectionName}</h3>
                  <p className="font-body text-lg glow-magenta">{album.artistName}</p>
                  <p className="font-display text-[8px] text-cyan-500/60 mt-1 uppercase tracking-wide">
                    {album.primaryGenreName} · {new Date(album.releaseDate).getFullYear()} · {album.trackCount} TRK
                  </p>
                </div>
              </div>
              <div className="pixel-rule-cyan mb-3" />
              <div className="space-y-2">
                {album.songs.map((song) => (
                  <div key={song.trackId} className="border border-yellow-400/10 bg-cab-black/60 p-2">
                    <p className="font-display text-[8px] text-yellow-200/80 mb-1">
                      {song.trackNumber && <span className="glow-yellow mr-1">{song.trackNumber}.</span>}
                      {song.trackName?.toUpperCase()}
                    </p>
                    {song.previewUrl && <audio controls src={song.previewUrl} className="w-full" />}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      {albums && albums.length === 0 && (
        <div className="py-10 text-center font-display text-[9px] text-yellow-600/40 uppercase tracking-widest blink">
          NO RESULTS FOUND
        </div>
      )}
    </>
  );
}