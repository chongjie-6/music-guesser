import { useNavigate } from "react-router-dom";

export default function PlayWithFriendsButton() {
  const navigate = useNavigate();
  return (
    <button
      className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
      onClick={() => navigate("/play-with-friends")}
    >
      Play with friends
    </button>
  );
}
