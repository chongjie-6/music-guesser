export type Message = {
  message: string;
  senderId: string;
  senderName: string;
};

export type PlayerScore = {
  id: string;
  name: string;
  score: number;
};

export type GameRound = {
  round: number;
  previewUrl: string;
  artistName: string;
  primaryGenreName: string;
  releaseDate: string | null;
  scores: PlayerScore[];
  timeLeftMs: number;
};

export type GameEnd = {
  winner: string | null;
  scores: PlayerScore[];
  isTie: boolean;
  topScore: number;
};
