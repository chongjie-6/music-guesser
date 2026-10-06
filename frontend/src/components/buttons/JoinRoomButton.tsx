import { useNavigate } from "react-router-dom";

export const JoinRoomButton = ({ roomID }: { roomID: string }) => {
  const navigate = useNavigate();
  // Room ids are always lowercase, and phone keyboards capitalise the first letter
  const id = roomID.trim().toLowerCase();
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
