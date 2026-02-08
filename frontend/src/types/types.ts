export type Song = {
  artistId: number;
  artistName: string;
  artworkUrl100: string;
  collectionViewUrl: string;
  previewUrl: string;
  primaryGenreName: string;
  releaseDate: string;
  trackName: string;
};

export type Message = {
  message: string;
  senderId: string;
  senderName: string;
  timestamp: number;
};
