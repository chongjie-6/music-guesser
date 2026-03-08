const { getRandomSong } = require("./spotifyService");
const songsByRoom = new Map();
const MAX_ROUNDS = 10;

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

/**
 * Determines the winner from the scores object.
 */
const computeGameResult = (scores) => {
  const entries = Object.entries(scores);
  if (entries.length === 0)
    return { winner: null, scores, isTie: true, topScore: 0 };

  const sorted = entries.sort(([, a], [, b]) => b - a);
  const topScore = sorted[0][1];
  const topPlayers = sorted.filter(([, s]) => s === topScore);
  const isTie = topPlayers.length > 1;

  return {
    winner: isTie ? null : sorted[0][0],
    scores,
    isTie,
    topScore,
  };
};

const startRoomGame = async (roomId) => {
  const song = await getRandomSong();

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

  // Check if this was the last round
  if (game.round >= MAX_ROUNDS) {
    game.isActive = false;
    return {
      status: "correct",
      winner: scorerName,
      answer: correctTrackName,
      gameOver: true,
      result: computeGameResult(game.scores),
    };
  }

  const nextSong = await getRandomSong();
  game.song = nextSong;
  game.round += 1;
  game.normalizedAnswer = normalizeText(nextSong.song_name);

  return {
    status: "correct",
    winner: scorerName,
    answer: correctTrackName,
    gameOver: false,
    nextRound: {
      ...buildPublicRound(nextSong, game.round),
      scores: game.scores,
    },
  };
};

/**
 * Skips the current round without awarding any points.
 */
const skipRound = async (roomId) => {
  const game = songsByRoom.get(roomId);
  if (!game?.isActive) return null;

  const skippedSongName = game.song.song_name;

  // Check if this was the last round
  if (game.round >= MAX_ROUNDS) {
    game.isActive = false;
    return {
      answer: skippedSongName,
      gameOver: true,
      result: computeGameResult(game.scores),
    };
  }

  const nextSong = await getRandomSong();
  game.song = nextSong;
  game.round += 1;
  game.normalizedAnswer = normalizeText(nextSong.song_name);
  console.log(`Round skipped. Answer was: ${skippedSongName}`);

  return {
    answer: skippedSongName,
    gameOver: false,
    nextRound: {
      ...buildPublicRound(nextSong, game.round),
      scores: game.scores,
    },
  };
};

const destroyRoomGame = (roomId) => {
  songsByRoom.delete(roomId);
};

module.exports = {
  getRoomGame,
  startRoomGame,
  submitGuess,
  skipRound,
  destroyRoomGame,
};
