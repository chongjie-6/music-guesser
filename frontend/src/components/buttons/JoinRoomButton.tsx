import { useNavigate } from "react-router-dom";
import type { Socket } from "socket.io-client";
import { setUserNameSocket } from "../../hooks/useSetUserNameSocket";

export const JoinRoomButton = ({
  socket,
  roomID,
}: {
  socket: Socket;
  roomID: string;
}) => {
  const navigate = useNavigate();
  const onJoinRoom = async () => {
    if (!roomID.trim()) return;
    setUserNameSocket();
    socket.emit("join-room", roomID);
    navigate(`/play-with-friends/room/${roomID}`);
  };
  return (
    <button onClick={onJoinRoom} className="btn btn-yellow text-sm">
      ▶ JOIN ROOM
    </button>
  );
};
