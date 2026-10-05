import { useNavigate } from "react-router-dom";

export const JoinRoomButton = ({ roomID }: { roomID: string }) => {
  const navigate = useNavigate();
  const id = roomID.trim();
  return (
    <button
      onClick={() => navigate(`/play-with-friends/room/${encodeURIComponent(id)}`)}
      disabled={!id}
      className="btn btn-yellow text-sm"
    >
      ▶ JOIN ROOM
    </button>
  );
};
