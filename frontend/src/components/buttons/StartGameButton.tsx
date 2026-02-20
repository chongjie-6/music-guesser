import { socket } from "../../socket";

export const StartGameButton = ({ roomID }: { roomID: string | undefined }) => {
  const onStartGame = async (id: string) => {
    socket.emit("start-game", id);
  };

  return (
    <button
      onClick={() => roomID && onStartGame(roomID)}
      disabled={!roomID}
      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      Start game
    </button>
  );
};
