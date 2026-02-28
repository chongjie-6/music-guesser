import { useNavigate } from "react-router-dom";

export default function PlayWithFriendsButton() {
  const navigate = useNavigate();
  return (
    <button className="btn btn-gradient px-8 py-3 text-sm" onClick={() => navigate("/play-with-friends")}>
      ▶ Play with Friends
    </button>
  );
}