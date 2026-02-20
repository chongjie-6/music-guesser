export type AlbumSong = {
  trackId: number;
  trackName: string;
  previewUrl?: string;
  trackNumber?: number;
  trackTimeMillis?: number;
};

export type Album = {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100: string;
  releaseDate: string;
  primaryGenreName: string;
  trackCount: number;
  songs: AlbumSong[];
};

export type Message = {
  message: string;
  senderId: string;
  senderName: string;
  timestamp: number;
};

export type ScoreBoard = Record<string, number>;

export type GameRound = {
  round: number;
  previewUrl: string;
  artistName: string;
  primaryGenreName: string;
  releaseDate: string;
  scores: ScoreBoard;
};
