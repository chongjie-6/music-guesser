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
    <button
      onClick={onJoinRoom}
      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
    >
      Join room
    </button>
  );
};
