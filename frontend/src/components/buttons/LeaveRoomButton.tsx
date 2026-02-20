import { type Socket } from "socket.io-client";

export const LeaveRoomButton = ({
  socket,
  roomID,
}: {
  socket: Socket;
  roomID: string;
}) => {
  const onLeaveRoom = async () => {
    socket.emit("leave-room", roomID);
  };

  return (
    <button
      onClick={onLeaveRoom}
      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      Leave room
    </button>
  );
};
