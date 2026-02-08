import { type Socket } from "socket.io-client";
export const LeaveRoomButton = ({ socket }: { socket: Socket }) => {
  const onLeaveRoom = async () => {
    const roomID = crypto.randomUUID();
    socket.emit("leave-room", roomID);
  };
  return <button onClick={onLeaveRoom}>Leave Room</button>;
};
