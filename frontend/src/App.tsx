import { useState } from "react";
import "./App.css";
import type { Song } from "./types/types";
import { apiGet } from "./api/client";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";

function App() {
  const [query, setQuery] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const debouncedQuery = useDebouncedCallback(() => {
    setQuery(queryInput);
  }, 300);

  const { data: currentSongs, error } = useQuery<Song[]>({
    queryKey: [query],
    queryFn: () => apiGet(`/songs`, { query, limit: "5" }),
    enabled: query.length > 0,
  });

  return (
    <div className="container">
      {currentSongs &&
        currentSongs.map((song) => {
          return (
            <div key={song.trackName} className="flex flex-col">
              <h2>{song.trackName}</h2>
              <img src={song?.artworkUrl100} alt="artwork" />
              <audio controls src={song?.previewUrl} />
            </div>
          );
        })}

      {error && <div>Error fetching songs.</div>}

      <div>
        <input
          type="text"
          placeholder="Enter song name"
          onChange={(e) => setQueryInput(e.target.value)}
        />
        <button type="button" onClick={() => debouncedQuery()}>
          Submit
        </button>
      </div>
    </div>
  );
}

export default App;
