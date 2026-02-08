import type { Socket } from "socket.io-client";

export const JoinRoomButton = ({
  socket,
  roomID,
}: {
  socket: Socket;
  roomID: string;
}) => {
  const onJoinRoom = async () => {
    socket.emit("join-room", roomID);
  };
  return <button onClick={onJoinRoom}>Join Room</button>;
};
