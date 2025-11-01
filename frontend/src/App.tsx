import { useState } from "react";
import "./App.css";
import type { Song } from "./types/types";

function App() {
  const [query, setQuery] = useState("");
  const [currentSong, setCurrentSong] = useState<Song>();

  const fetchPreviewURL = async (query: string) => {
    const response = await fetch(
      import.meta.env.VITE_API_URL + `/songs?query=${query}`,
      {
        method: "GET",
      }
    ).then((res) => res.json());
    console.log(response);
    setCurrentSong(response);
  };

  const handleClick = () => {
    console.log("SUBMITTING...");
    fetchPreviewURL(query);
  };

  return (
    <>
      {currentSong && (
        <>
          <div className="flex flex-col">
            <h2>{currentSong.trackName}</h2>
            <img src={currentSong?.artworkUrl100} alt="artwork" />
          </div>
          <audio controls src={currentSong?.previewUrl} />
        </>
      )}

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
