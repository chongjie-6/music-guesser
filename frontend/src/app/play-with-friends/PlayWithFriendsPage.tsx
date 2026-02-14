import { useState } from "react";
import { CreateRoomButton } from "../../components/buttons/CreateRoomButton";
import { JoinRoomButton } from "../../components/buttons/JoinRoomButton";
import { socket } from "../../socket";
import { useErrorSocket } from "../../hooks/useErrorSocket";

export default function PlayWithFriendsPage() {
  const [socketMessage, setSocketMessage] = useState<string>("");
  const [roomID, setRoomID] = useState<string | "">("");
  useErrorSocket(setSocketMessage);

  return (
    <div className="space-x-2 w-screen flex flex-col items-center justify-center">
      {socketMessage && <p className="text-red-500">{socketMessage}</p>}
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomID}
        onChange={(e) => setRoomID(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="space-x-2 mt-2">
        <JoinRoomButton socket={socket} roomID={roomID} />
        <CreateRoomButton socket={socket} />
      </div>
    </div>
  );
}
