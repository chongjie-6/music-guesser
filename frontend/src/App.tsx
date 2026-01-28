import { useState } from "react";
import "./App.css";
import type { Song } from "./types/types";
import { apiGet } from "./api/client";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";
import { socket } from "./socket";
import { useSocket } from "./hooks/useSocket";
import { JoinRoomButton } from "./components/JoinRoomButton";
import { CreateRoomButton } from "./components/CreateRoomButton";

function App() {
  const [query, setQuery] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const debouncedQuery = useDebouncedCallback(() => {
    setQuery(queryInput);
  }, 300);
  const [socketMessage, setSocketMessage] = useState<string | null>(null);
  const [roomID, setRoomID] = useState<string | "">("");

  useSocket(socket, setSocketMessage);

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
    <div className="mx-auto p-6 w-screen flex flex-col items-center space-y-5">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Song Search</h1>
        <div className="flex gap-2 w-full max-w-md">
          <input
            type="text"
            placeholder="Enter song name"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && debouncedQuery()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => debouncedQuery()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {isLoading && <div className="text-center py-8">Loading...</div>}

      {error && (
        <div className="text-red-500 bg-red-50 p-4 rounded-lg text-center">
          Error fetching songs.
        </div>
      )}

      {currentSongs && currentSongs.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-xl">
          {currentSongs.map((song) => (
            <div
              key={song.trackName}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={song?.artworkUrl100}
                alt={`${song.trackName} artwork`}
                className="w-full h-auto rounded-md mb-3"
              />
              <h2 className="text-lg font-semibold mb-2 line-clamp-2">
                {song.trackName}
              </h2>
              <audio controls src={song?.previewUrl} className="w-full" />
            </div>
          ))}
        </div>
      )}

      {currentSongs && currentSongs.length === 0 && (
        <div className="text-center text-gray-500 py-8">No songs found.</div>
      )}

      {socketMessage && <p className="text-red-500">{socketMessage}</p>}
      <div className="space-x-2">
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomID}
          onChange={(e) => setRoomID(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <JoinRoomButton socket={socket} roomID={roomID} />
        <CreateRoomButton socket={socket} />
      </div>
    </div>
  );
}

export default App;
