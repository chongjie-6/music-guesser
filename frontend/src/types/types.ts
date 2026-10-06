export type Message = {
  message: string;
  senderId: string;
  senderName: string;
  type?: "system" | "close" | "solved";
};

export type Player = {
  id: string;
  name: string;
  score: number;
  connected: boolean;
  spectator: boolean;
  guessed: boolean;
};

export type GameMode = "title" | "artist" | "choice";

export type Settings = {
  rounds: number;
  roundSeconds: number;
  mode: GameMode;
  genre: string;
  era: string;
};

export type RoomKind = "party" | "solo" | "daily";

export type RoomState = {
  roomId: string;
  kind: RoomKind;
  hostId: string;
  dailyDate: string | null;
  settings: Settings;
  genres: string[];
  running: boolean;
  maxPlayers: number;
  players: Player[];
};

export type Hints = {
  year: string;
  genre?: string;
  artist?: string;
  letters?: string;
};

export type GameRound = {
  round: number;
  totalRounds: number;
  mode: GameMode;
  previewUrl: string;
  artwork: string | null;
  hints: Hints;
  stage: number;
  options: string[] | null;
  picked: number | null;
  solved: Solved | null;
  musicStopped: boolean;
  timeLeftMs: number;
  elapsedMs: number;
};

export type Solved = {
  points: number;
  answer: string;
};

export type Guesser = {
  id: string;
  name: string;
  points: number;
};

export type Reveal = {
  answer: string;
  artist: string;
  artwork: string | null;
  artistUrl: string | null;
  guessers: Guesser[];
};

export type PlayerScore = {
  id: string;
  name: string;
  score: number;
};

export type GameEnd = {
  winner: string | null;
  scores: PlayerScore[];
  isTie: boolean;
  topScore: number;
  recap: Reveal[];
  daily: string | null;
};
