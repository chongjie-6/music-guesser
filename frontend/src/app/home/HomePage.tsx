import "../../App.css";
import PlayWithFriendsButton from "../../components/buttons/PlayWithFriendsButton";
import SongSearchForm from "../../components/SongSearchForm";

export default function HomePage() {
  return (
    <div className="mx-auto p-6 w-screen flex flex-col items-center space-y-5">
      <SongSearchForm />
      <PlayWithFriendsButton />
    </div>
  );
}
