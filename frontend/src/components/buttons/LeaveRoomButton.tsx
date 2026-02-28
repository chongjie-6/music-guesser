import { useNavigate } from "react-router-dom";
import { type Socket } from "socket.io-client";

export const LeaveRoomButton = ({ socket, roomID }: { socket: Socket; roomID: string }) => {
  const navigate = useNavigate();
  const onLeaveRoom = async () => {
    socket.emit("leave-room", roomID);
    navigate("/play-with-friends");
  };
  return (
    <button onClick={onLeaveRoom} className="btn btn-danger-outline px-4 py-2">
      Leave
    </button>
  );
};