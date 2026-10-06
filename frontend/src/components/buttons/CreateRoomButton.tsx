import { useNavigate } from "react-router-dom";
import { socket } from "../../socket";
import type { RoomKind } from "../../types/types";

export const CreateRoomButton = ({
  kind = "party",
  label = "+ CREATE ROOM",
  className = "btn btn-cyan text-sm",
}: {
  kind?: RoomKind;
  label?: string;
  className?: string;
}) => {
  const navigate = useNavigate();

  const onCreateRoom = () => {
    // Not crypto.randomUUID: it's undefined on plain-http LAN addresses
    const roomId = Math.random().toString(36).slice(2, 10);
    socket.emit("create-room", { roomId, kind });
    navigate(`/play-with-friends/room/${roomId}`);
  };

  return (
    <button onClick={onCreateRoom} className={className}>
      {label}
    </button>
  );
};
