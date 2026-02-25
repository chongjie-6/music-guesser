const { getRandomSong } = require("./spotifyService");
const songsByRoom = new Map();

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

  const nextSong = await getRandomSong();
  game.song = nextSong;
  game.round += 1;
  game.normalizedAnswer = normalizeText(nextSong.song_name);
  console.log(normalizeText(nextSong.song_name));

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

/**
 * Skips the current round without awarding any points.
 * Returns the skipped song's name and the next round data.
 */
const skipRound = async (roomId) => {
  const game = songsByRoom.get(roomId);
  if (!game?.isActive) return null;

  const skippedSongName = game.song.song_name;

  const nextSong = await getRandomSong();
  game.song = nextSong;
  game.round += 1;
  game.normalizedAnswer = normalizeText(nextSong.song_name);
  console.log(`Round skipped. Answer was: ${skippedSongName}`);

  return {
    answer: skippedSongName,
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
  skipRound,
};
