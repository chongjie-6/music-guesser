import { socket } from "../../socket";

export const StartGameButton = ({ roomID }: { roomID: string | undefined }) => {
  const onStartGame = async (id: string) => socket.emit("start-game", id);
  return (
    <button
      onClick={() => roomID && onStartGame(roomID)}
      disabled={!roomID}
      className="btn btn-green text-[8px]"
    >
      ▶ START GAME
    </button>
  );
};