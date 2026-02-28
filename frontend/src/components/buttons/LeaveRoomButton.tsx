import { useNavigate } from "react-router-dom";
import { type Socket } from "socket.io-client";

export const LeaveRoomButton = ({
  socket,
  roomID,
}: {
  socket: Socket;
  roomID: string;
}) => {
  const navigate = useNavigate();
  const onLeaveRoom = async () => {
    socket.emit("leave-room", roomID);
    navigate("/play-with-friends");
  };
  return (
    <button onClick={onLeaveRoom} className="btn btn-red text-sm">
      ✕ LEAVE
    </button>
  );
};
