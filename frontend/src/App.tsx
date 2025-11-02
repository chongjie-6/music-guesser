import { useState } from "react";
import "./App.css";
import type { Song } from "./types/types";
import { apiGet } from "./api/client";

function App() {
  const [query, setQuery] = useState("");
  const [currentSongs, setCurrentSongs] = useState<Song[]>();

  const fetchPreviewURL = async (query: string) => {
    const songs = await apiGet(`/songs?query=${query}`);
    console.log(songs);
    setCurrentSongs(songs);
  };

  const handleClick = () => {
    console.log("SUBMITTING...");
    fetchPreviewURL(query);
  };

  return (
    <>
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

      <div>
        <input
          type="text"
          placeholder="Enter song name"
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="button" onClick={handleClick}>
          Submit
        </button>
      </div>
    </>
  );
}

export default App;
