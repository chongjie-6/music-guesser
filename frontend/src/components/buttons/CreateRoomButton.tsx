import { useNavigate } from "react-router-dom";
import { type Socket } from "socket.io-client";
export const CreateRoomButton = ({ socket }: { socket: Socket }) => {
  const navigate = useNavigate();
  const onCreateRoom = async () => {
    const roomID = crypto.randomUUID();
    socket.emit("create-room", roomID);
    navigate(`/play-with-friends/room/${roomID}`);
  };
  return <button onClick={onCreateRoom}>Create Room</button>;
};
