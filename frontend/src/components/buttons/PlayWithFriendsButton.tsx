import { useNavigate } from "react-router-dom";

export default function PlayWithFriendsButton() {
  const navigate = useNavigate();
  return (
    <button
      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      onClick={() => navigate("/play-with-friends")}
    >
      Play With Friends
    </button>
  );
}
