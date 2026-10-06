import { CreateRoomButton } from "./buttons/CreateRoomButton";

export default function RoomNotFoundModal({
  message,
  onGoBack,
}: {
  message: string;
  onGoBack: () => void;
}) {
  const notFound = message === "Room does not exist";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cab-black/90 bg-pixel-grid">
      <div className="w-full max-w-md mx-4">
        <div className="pixel-box-red p-8">
          <div className="pixel-rule-rainbow mb-6" />

          <p className="font-display text-sm glow-red blink tracking-widest uppercase mb-4">
            ⚠ ERROR ⚠
          </p>
          <h2 className="font-display text-xl glow-red uppercase mb-4 leading-snug">
            {notFound ? "ROOM NOT FOUND" : "CAN'T JOIN"}
          </h2>
          <p className="font-body text-xl text-red-300/70 mb-6 leading-relaxed uppercase">
            {notFound
              ? "THIS ROOM DOESN'T EXIST OR HAS ALREADY ENDED. CREATE A NEW ONE TO CONTINUE."
              : message}
          </p>

          <div className="flex gap-3 flex-wrap">
            <CreateRoomButton />
            <button onClick={onGoBack} className="btn btn-yellow text-sm">
              ← GO BACK
            </button>
          </div>
          <div className="pixel-rule-red mt-6" />
        </div>
      </div>
    </div>
  );
}
