import { socket } from "../../socket";
export const StartGameButton = ({ roomID }: { roomID: string | undefined }) => {
  const onStartGame = async (roomID: string) => {
    socket.emit("start-game", roomID);
  };
  return <button onClick={() => onStartGame(roomID!)}>Start Game</button>;
};
