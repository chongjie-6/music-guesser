import { type Socket } from "socket.io-client";
export const StartGameButton = ({ socket, roomID }: { socket: Socket; roomID: string }) => {
  const onStartGame = async (roomID: string) => {
    socket.emit("start-game", roomID);
  };
  return <button onClick={() => onStartGame(roomID)}>Start Game</button>;
};
