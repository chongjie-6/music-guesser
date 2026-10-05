import { useNavigate } from "react-router-dom";

export const JoinRoomButton = ({ roomID }: { roomID: string }) => {
  const navigate = useNavigate();
  const onJoinRoom = () => {
    const id = roomID.trim();
    if (id) navigate(`/play-with-friends/room/${encodeURIComponent(id)}`);
  };
  return (
    <button onClick={onJoinRoom} className="btn btn-yellow text-sm">
      ▶ JOIN ROOM
    </button>
  );
};
