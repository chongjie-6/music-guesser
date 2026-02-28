import { useNavigate } from "react-router-dom";

export default function PlayWithFriendsButton() {
  const navigate = useNavigate();
  return (
    <button className="btn btn-yellow-fill px-8 py-4 text-[10px] tracking-widest" onClick={() => navigate("/play-with-friends")}>
      ▶ PLAY WITH FRIENDS
    </button>
  );
}