const { getRandomSongs } = require("./songService");
const games = new Map();
const MAX_ROUNDS = 10;

const normalizeText = (value = "") => {
  const text = String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[([（［][^)\]）］]*[)\]）］]/g, "")
    .replace(/\s+-\s.*$/, "");
  // Titles with no Latin characters fall back to Unicode letters and digits
  return text.replace(/[^a-z0-9]/g, "") || text.replace(/[^\p{L}\p{N}]/gu, "");
};

const currentSong = (game) => game.songs[game.round - 1];

const publicScores = (game) =>
  [...game.scores.values()].sort((a, b) => b.score - a.score);

const buildPublicRound = (game) => {
  const song = currentSong(game);
  return {
    round: game.round,
    previewUrl: song.song_preview_url,
    artistName: song.artist_name,
    primaryGenreName: song.genre_name,
    releaseDate: song.released_on,
    scores: publicScores(game),
  };
};

const computeGameResult = (game) => {
  const scores = publicScores(game);
  const topScore = scores[0]?.score ?? 0;
  const topPlayers = scores.filter((p) => p.score === topScore);

  return {
    winner: topPlayers.length === 1 ? topPlayers[0].name : null,
    scores,
    isTie: topPlayers.length > 1,
    topScore,
  };
};

const isGameRunning = (roomId) =>
  ["loading", "active"].includes(games.get(roomId)?.status);

const startRoomGame = async (roomId) => {
  const game = { status: "loading", round: 1, songs: [], scores: new Map() };
  games.set(roomId, game);

  try {
    game.songs = await getRandomSongs(MAX_ROUNDS);
  } catch (error) {
    if (games.get(roomId) === game) games.delete(roomId);
    throw error;
  }

  // Room was destroyed while songs were loading
  if (games.get(roomId) !== game) return null;

  game.status = "active";
  return buildPublicRound(game);
};

const advanceRound = (game) => {
  if (game.round >= game.songs.length) {
    game.status = "over";
    return { gameOver: true, result: computeGameResult(game) };
  }

  game.round += 1;
  return { gameOver: false, nextRound: buildPublicRound(game) };
};

const submitGuess = ({ roomId, userId, userName, guess }) => {
  const game = games.get(roomId);
  if (game?.status !== "active") return null;

  const answer = currentSong(game).song_name;
  const normalizedGuess = normalizeText(guess);
  if (!normalizedGuess || normalizedGuess !== normalizeText(answer)) return null;

  const player = game.scores.get(userId) ?? { id: userId, score: 0 };
  player.name = userName;
  player.score += 1;
  game.scores.set(userId, player);

  return { winner: userName, answer, ...advanceRound(game) };
};

/**
 * Skips the current round without awarding any points.
 */
const skipRound = (roomId) => {
  const game = games.get(roomId);
  if (game?.status !== "active") return null;

  return { answer: currentSong(game).song_name, ...advanceRound(game) };
};

const destroyRoomGame = (roomId) => {
  games.delete(roomId);
};

module.exports = {
  normalizeText,
  isGameRunning,
  startRoomGame,
  submitGuess,
  skipRound,
  destroyRoomGame,
};
