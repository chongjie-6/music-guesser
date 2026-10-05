import { useNavigate } from "react-router-dom";
import { type Socket } from "socket.io-client";

export const CreateRoomButton = ({ socket }: { socket: Socket }) => {
  const navigate = useNavigate();
  const onCreateRoom = () => {
    // Not crypto.randomUUID: it's undefined on plain-http LAN addresses
    const roomID = Math.random().toString(36).slice(2, 10);
    socket.emit("create-room", roomID);
    navigate(`/play-with-friends/room/${roomID}`);
  };
  return (
    <button onClick={onCreateRoom} className="btn btn-cyan text-sm">
      + CREATE ROOM
    </button>
  );
};
