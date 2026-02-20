const songsByRoom = new Map();

const SONG_QUERIES = [
  "pop",
  "rock",
  "hip hop",
  "edm",
  "indie",
  "rnb",
  "latin",
  "jazz",
];

const normalizeText = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const getRandomQuery = () =>
  SONG_QUERIES[Math.floor(Math.random() * SONG_QUERIES.length)];

const buildPublicRound = (song, round) => ({
  round,
  previewUrl: song.previewUrl,
  artistName: song.artistName,
  primaryGenreName: song.primaryGenreName,
  releaseDate: song.releaseDate,
});

const getRandomSong = async () => {
  const query = encodeURIComponent(getRandomQuery());
  const response = await fetch(
    `https://itunes.apple.com/search?term=${query}&entity=song&limit=25`
  );
  const data = await response.json();

  if (!response.ok || !data.results?.length) {
    throw new Error("Could not fetch a song for this round");
  }

  return data.results[Math.floor(Math.random() * data.results.length)];
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
