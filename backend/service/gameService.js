const { getRandomSong } = require("./spotifyService");
const songsByRoom = new Map();

const QUERIES = [
  // Pop
  "genre:pop year:2010-2020",
  "genre:dance-pop year:2010-2020",
  "genre:indie-pop year:2010-2020",
  "genre:hip-hop year:2010-2020",
  "genre:r-n-b year:2010-2020",
  "genre:trap year:2015-2020",
  // Rock & Alternative
  "genre:rock year:2010-2020",
  "genre:indie year:2010-2020",
  "genre:alternative year:2010-2020",
  // Soul & funk
  "genre:soul year:2010-2020",
  "genre:funk year:2010-2020",
];

const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\(\[（［][^)\]）］]*[\)\]）］]|[^\w\s]/g, "")
    .trim()
    .replace(/[^a-z0-9]/g, "");

const buildPublicRound = (song, round) => ({
  round,
  previewUrl: song.song_preview_url,
  artistName: song.artist_name,
  primaryGenreName: song.genre_name,
  releaseDate: song.released_on,
});

const getRandomQuery = () => {
  return encodeURIComponent(
    QUERIES[Math.floor(Math.random() * QUERIES.length)],
  );
};

const startRoomGame = async (roomId) => {
  const query = getRandomQuery();
  const song = await getRandomSong(query);

  const initialState = {
    isActive: true,
    round: 1,
    song,
    normalizedAnswer: normalizeText(song.song_name),
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
  if (!game?.isActive) return { status: "inactive" };

  if (normalizeText(guess) !== game.normalizedAnswer) {
    return { status: "incorrect" };
  }

  const scorerName = userName || userId;
  game.scores[scorerName] = (game.scores[scorerName] || 0) + 1;

  const correctTrackName = game.song.song_name;

  const nextSong = await getRandomSong();
  game.song = nextSong;
  game.round += 1;
  game.normalizedAnswer = normalizeText(nextSong.song_name);

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
  getRandomQuery,
};
