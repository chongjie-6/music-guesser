const songsByRoom = new Map();

const ALBUM_QUERIES = [
  "top global hits",
  "top global hits 2010s",
  "global hits",
  "best of pop hits",
  "greatest hits 2010s",
];

const normalizeText = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const getRandomQuery = () =>
  ALBUM_QUERIES[Math.floor(Math.random() * ALBUM_QUERIES.length)];

const buildPublicRound = (song, round) => ({
  round,
  previewUrl: song.previewUrl,
  artistName: song.artistName,
  primaryGenreName: song.primaryGenreName,
  releaseDate: song.releaseDate,
});

const getSongsFromAlbum = async (collectionId) => {
  const response = await fetch(
    `https://itunes.apple.com/lookup?id=${collectionId}&entity=song&limit=50`
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch album tracks");
  }

  return (data.results || []).filter(
    (item) =>
      item.wrapperType === "track" &&
      item.kind === "song" &&
      item.previewUrl &&
      item.trackName
  );
};

const getRandomSong = async () => {
  const query = encodeURIComponent(getRandomQuery());
  const albumResponse = await fetch(
    `https://itunes.apple.com/search?term=${query}&entity=album&limit=20`
  );
  const albumData = await albumResponse.json();

  if (!albumResponse.ok || !albumData.results?.length) {
    throw new Error("Could not fetch albums for this round");
  }

  const shuffledAlbums = [...albumData.results].sort(() => Math.random() - 0.5);

  for (const album of shuffledAlbums) {
    const albumSongs = await getSongsFromAlbum(album.collectionId);
    if (albumSongs.length > 0) {
      return albumSongs[Math.floor(Math.random() * albumSongs.length)];
    }
  }

  throw new Error("Could not find playable songs from fetched albums");
};

const startRoomGame = async (roomId) => {
  const song = await getRandomSong();
  const initialState = {
    isActive: true,
    round: 1,
    song,
    normalizedAnswer: normalizeText(song.trackName),
    scores: {},
  };

  songsByRoom.set(roomId, initialState);

  return {
    ...buildPublicRound(song, initialState.round),
    scores: initialState.scores,
  };
};

const getRoomGame = (roomId) => songsByRoom.get(roomId);

const submitGuess = async ({ roomId, userId, userName, guess }) => {
  const game = songsByRoom.get(roomId);
  if (!game?.isActive) {
    return { status: "inactive" };
  }

  if (normalizeText(guess) !== game.normalizedAnswer) {
    return { status: "incorrect" };
  }

  const scorerName = userName || userId;
  game.scores[scorerName] = (game.scores[scorerName] || 0) + 1;

  const correctTrackName = game.song.trackName;

  const nextSong = await getRandomSong();
  game.song = nextSong;
  game.round += 1;
  game.normalizedAnswer = normalizeText(nextSong.trackName);

  return {
    status: "correct",
    winner: scorerName,
    answer: correctTrackName,
    nextRound: {
      ...buildPublicRound(nextSong, game.round),
      scores: game.scores,
    },
  };
};

module.exports = {
  getRoomGame,
  startRoomGame,
  submitGuess,
};
