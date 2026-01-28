import { type Socket } from "socket.io-client";
export const CreateRoomButton = ({ socket }: { socket: Socket }) => {
  const onCreateRoom = async () => {
    const roomID = crypto.randomUUID();
    socket.emit("create-room", roomID);
  };
  return <button onClick={onCreateRoom}>Create Room</button>;
};
