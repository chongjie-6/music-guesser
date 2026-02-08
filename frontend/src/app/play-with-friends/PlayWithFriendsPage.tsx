import { useState } from "react";
import { CreateRoomButton } from "../../components/buttons/CreateRoomButton";
import { JoinRoomButton } from "../../components/buttons/JoinRoomButton";
import { StartGameButton } from "../../components/buttons/StartGameButton";
import { socket } from "../../socket";
import { useErrorSocket } from "../../hooks/useErrorSocket";

export default function PlayWithFriendsPage() {
  const [socketMessage, setSocketMessage] = useState<string>("");
  const [roomID, setRoomID] = useState<string | "">("");
  useErrorSocket(setSocketMessage);

  return (
    <>
      {socketMessage && <p className="text-red-500">{socketMessage}</p>}
      <div className="space-x-2">
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomID}
          onChange={(e) => setRoomID(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <JoinRoomButton socket={socket} roomID={roomID}/>
      <CreateRoomButton socket={socket}/>
      <StartGameButton socket={socket} roomID={roomID} />
    </>
  );
}
