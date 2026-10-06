import { socket } from "../socket";
import type { RoomState, Settings } from "../types/types";

type Choice = [string | number, string];

const fields = (genres: string[]): [keyof Settings, string, Choice[]][] => [
  [
    "mode",
    "MODE",
    [
      ["title", "GUESS TITLE"],
      ["artist", "GUESS ARTIST"],
      ["choice", "MULTIPLE CHOICE"],
    ],
  ],
  ["rounds", "ROUNDS", [5, 10, 15, 20].map((n) => [n, `${n}`])],
  ["roundSeconds", "MUSIC", [10, 15, 20, 30].map((n) => [n, `${n}S`])],
  ["genre", "GENRE", [["any", "ANY GENRE"], ...genres.map((g): Choice => [g, g.toUpperCase()])]],
  [
    "era",
    "ERA",
    [
      ["any", "ANY ERA"],
      ["classic", "PRE-2000"],
      ["2000s", "2000S"],
      ["2010s", "2010S"],
      ["2020s", "2020S"],
    ],
  ],
];

export default function SettingsPanel({ room, isHost }: { room: RoomState; isHost: boolean }) {
  const update = (key: keyof Settings, raw: string) => {
    const value = typeof room.settings[key] === "number" ? Number(raw) : raw;
    socket.emit("update-settings", { roomId: room.roomId, settings: { [key]: value } });
  };

  return (
    <div className="pixel-box-cyan p-4">
      <p className="font-display text-sm glow-cyan tracking-widest mb-3">GAME SETTINGS</p>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2">
        {fields(room.genres).map(([key, label, choices]) => (
          <label key={key} className="contents">
            <span className="font-display text-xs text-cyan-500/70">{label}</span>
            <select
              value={room.settings[key]}
              onChange={(e) => update(key, e.target.value)}
              disabled={!isHost}
              className="w-full border-2 border-cyan-400/50 bg-cab-black px-2 py-2 text-cyan-200 disabled:opacity-60"
            >
              {choices.map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      {!isHost && (
        <p className="font-body text-lg text-cyan-200/50 mt-3">ONLY THE HOST CAN CHANGE THESE.</p>
      )}
    </div>
  );
}
