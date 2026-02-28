import { useNavigate } from "react-router-dom";
import { type Socket } from "socket.io-client";
import { setUserNameSocket } from "../../hooks/useSetUserNameSocket";

export const CreateRoomButton = ({ socket }: { socket: Socket }) => {
  const navigate = useNavigate();
  const onCreateRoom = async () => {
    const roomID = crypto.randomUUID();
    socket.emit("create-room", roomID);
    setUserNameSocket();
    navigate(`/play-with-friends/room/${roomID}`);
  };
  return (
    <button onClick={onCreateRoom} className="btn btn-cyan text-sm">
      + CREATE ROOM
    </button>
  );
};
