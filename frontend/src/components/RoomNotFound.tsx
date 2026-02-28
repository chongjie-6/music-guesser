import { CreateRoomButton } from "./buttons/CreateRoomButton";
import { socket } from "../socket";

export default function RoomNotFoundModal({ onGoBack }: { onGoBack: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-space-950/85">
      <div className="mx-4 w-full max-w-md rounded-2xl p-8 relative overflow-hidden card-red">
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-neon-red" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-neon-red" />

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10">
          <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h2 className="font-display text-xl font-bold uppercase tracking-wider glow-red">
          Room Not Found
        </h2>
        <p className="mt-2 text-slate-400 text-sm">
          This room doesn't exist or has already ended. Create a new one to continue.
        </p>
        <div className="mt-6 flex gap-3">
          <CreateRoomButton socket={socket} />
          <button onClick={onGoBack} className="btn btn-ghost flex-1">
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}