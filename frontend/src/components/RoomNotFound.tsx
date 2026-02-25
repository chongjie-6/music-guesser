import { CreateRoomButton } from "./buttons/CreateRoomButton";
import { socket } from "../socket";
export default function RoomNotFoundModal({
  onGoBack,
}: {
  onGoBack: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
          <svg
            className="h-6 w-6 text-rose-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Room not found</h2>
        <p className="mt-2 text-slate-600">
          This room doesn't exist or may have already ended. Would you like to
          create a new one?
        </p>
        <div className="mt-6 flex gap-3">
          <CreateRoomButton socket={socket} />
          <button
            onClick={onGoBack}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
