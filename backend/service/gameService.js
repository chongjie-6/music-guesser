const { getSongs } = require("./songService");
const { prepareForGame, seatedPlayers } = require("./roomService");

const HINT_STAGES = 4;
const SILENT_GUESS_MS = 5000;
const ROUND_BREAK_MS = 5000;
const MAX_POINTS = 1000;
const LATER_GUESS_PENALTY = 50;

// Bracketed text and " - Remastered 2011" style suffixes
const stripExtras = (value = "") =>
  String(value)
    .replace(/[([（［][^)\]）］]*[)\]）］]/g, "")
    .replace(/\s+-\s.*$/, "")
    .trim();

const displayTitle = (title) => stripExtras(title) || title;

const normalizeText = (value = "") => {
  const unaccented = String(value).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const text = stripExtras(unaccented) || unaccented;
  // Titles with no Latin characters fall back to Unicode letters and digits
  return text.replace(/[^a-z0-9]/g, "") || text.replace(/[^\p{L}\p{N}]/gu, "");
};

const levenshtein = (a, b) => {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = row;
  }
  return prev[b.length];
};

const typoAllowance = (length) => (length > 8 ? 2 : length > 4 ? 1 : 0);

/**
 * "correct" within a small typo allowance, "close" when the guess would give
 * the answer away to other players, otherwise null.
 */
const judgeGuess = (guess, answers) => {
  const g = normalizeText(guess);
  if (!g) return null;
  let verdict = null;
  for (const answer of answers) {
    const a = normalizeText(answer);
    if (!a) continue;
    const distance = levenshtein(g, a);
    if (distance <= typoAllowance(a.length)) return "correct";
    const near = a.length >= 5 && distance <= a.length * 0.35;
    const overlaps = (a.length >= 3 && g.includes(a)) || (g.length >= 4 && a.includes(g));
    if (near || overlaps) verdict = "close";
  }
  return verdict;
};

// "Post Malone & Swae Lee" also accepts either artist on their own
const artistAnswers = (artist = "") => [artist, ...artist.split(/\s*[,&]\s*/)];

/**
 * Points that drop every millisecond until the round ends, minus 50 for each player who got it first.
 */
const pointsFor = (elapsedMs, musicMs, rank) =>
  Math.max(
    0,
    Math.round(MAX_POINTS * (1 - elapsedMs / (musicMs + SILENT_GUESS_MS))) - LATER_GUESS_PENALTY * rank,
  );

const maskAnswer = (text) =>
  displayTitle(text).replace(/\S+/g, (word) => {
    const [first, ...rest] = word;
    return first + rest.map((c) => (/[\p{L}\p{N}]/u.test(c) ? "_" : c)).join("");
  });

const hintsFor = (song, mode, stage) => {
  const hints = { year: song.released_on?.slice(0, 4) ?? "?" };
  if (stage >= 1) hints.genre = song.genre_name;
  // With four options by different artists, the artist would give the answer away
  if (stage >= 2 && mode === "title") hints.artist = song.artist_name;
  if (stage >= 3 && mode !== "choice") {
    hints.letters = maskAnswer(mode === "artist" ? song.artist_name : song.song_name);
  }
  return hints;
};

const shuffle = (items) => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const uniqueTitles = (titles) => [
  ...new Map(titles.map((t) => [normalizeText(t), displayTitle(t)])).values(),
];

/**
 * Four title options per song, with decoys taken from songs that aren't answers in this game.
 */
const buildChoices = (songs, decoys) => {
  const answerKeys = new Set(songs.map((s) => normalizeText(s.song_name)));
  let pool = uniqueTitles(decoys.map((s) => s.song_name)).filter((t) => !answerKeys.has(normalizeText(t)));
  if (pool.length < 3) pool = uniqueTitles([...pool, ...songs.map((s) => s.song_name)]);

  return songs.map((song) => {
    const answer = displayTitle(song.song_name);
    const others = pool.filter((t) => normalizeText(t) !== normalizeText(answer));
    const options = shuffle([answer, ...shuffle(others).slice(0, 3)]);
    return { options, correct: options.indexOf(answer) };
  });
};

const currentSong = (game) => game.songs[game.round - 1];

/**
 * Loads songs for a new game. Returns false if the room went away while loading.
 */
const startGame = async (room) => {
  const { settings } = room;
  const daily = room.kind === "daily";
  const filters = daily ? {} : { genre: settings.genre === "any" ? null : settings.genre, era: settings.era };
  const count = settings.rounds;
  const game = { status: "loading" };
  room.game = game;

  let songs;
  let choices = null;
  try {
    songs = await getSongs({
      count,
      ...filters,
      excludeIds: daily ? [] : [...room.playedSongIds],
      seed: daily ? `daily:${room.dailyDate}` : null,
    });
    // Every matching song has been played in this room, so start the cycle again
    if (!daily && songs.length < count && room.playedSongIds.size) {
      room.playedSongIds.clear();
      songs = await getSongs({ count, ...filters });
    }
    if (!songs.length) {
      throw Object.assign(new Error("No songs match these settings"), { expose: true });
    }
    if (settings.mode === "choice") {
      choices = buildChoices(songs, await getSongs({ count: count * 3, ...filters }));
    }
  } catch (error) {
    if (room.game === game) room.game = null;
    throw error;
  }
  if (room.game !== game) return false;

  if (!daily) songs.forEach((s) => room.playedSongIds.add(s.song_id));
  prepareForGame(room);
  Object.assign(game, {
    status: "active",
    songs,
    choices,
    mode: settings.mode,
    musicMs: settings.roundSeconds * 1000,
    round: 0,
    recap: [],
  });
  return true;
};

const beginRound = (room) => {
  const game = room.game;
  game.status = "active";
  game.round += 1;
  game.stage = 0;
  game.musicStopped = false;
  game.startedAt = Date.now();
  game.deadline = game.startedAt + game.musicMs;
  game.picks = new Map();
  game.guessers = [];
};

const hasSolved = (room, playerId) =>
  room.game?.status === "active" && room.game.guessers.some((g) => g.id === playerId);

const roundAnswer = (game) => {
  const song = currentSong(game);
  return game.mode === "artist" ? song.artist_name : song.song_name;
};

const roundPayload = (room, playerId) => {
  const game = room.game;
  const song = currentSong(game);
  const now = Date.now();
  const guesser = game.guessers.find((g) => g.id === playerId);
  return {
    round: game.round,
    totalRounds: game.songs.length,
    mode: game.mode,
    previewUrl: song.song_preview_url,
    artwork: song.song_artwork_url_100,
    hints: hintsFor(song, game.mode, game.stage),
    stage: game.stage,
    options: game.choices?.[game.round - 1].options ?? null,
    picked: game.picks.get(playerId) ?? null,
    solved: guesser ? { points: guesser.points, answer: roundAnswer(game) } : null,
    musicStopped: game.musicStopped,
    timeLeftMs: Math.max(0, game.deadline - now),
    elapsedMs: now - game.startedAt,
  };
};

const revealHint = (room) => {
  const game = room.game;
  game.stage += 1;
  return { stage: game.stage, hints: hintsFor(currentSong(game), game.mode, game.stage) };
};

const stopMusic = (room, silentMs) => {
  room.game.musicStopped = true;
  room.game.deadline = Date.now() + silentMs;
};

/**
 * Whether a chat message guesses the answer: "correct", "close", or "hidden"
 * for multiple choice, where a match is hidden but never scored.
 */
const guessVerdict = (room, text) => {
  const game = room.game;
  if (game?.status !== "active") return null;
  if (game.mode === "choice") {
    return judgeGuess(text, game.choices[game.round - 1].options) ? "hidden" : null;
  }
  const song = currentSong(game);
  return judgeGuess(text, game.mode === "artist" ? artistAnswers(song.artist_name) : [song.song_name]);
};

/**
 * Records a multiple choice pick: "correct", "wrong", or null if it isn't allowed.
 */
const pickOption = (room, playerId, index) => {
  const game = room.game;
  if (game?.status !== "active" || game.mode !== "choice" || game.picks.has(playerId)) return null;
  const { options, correct } = game.choices[game.round - 1];
  if (!Number.isInteger(index) || index < 0 || index >= options.length) return null;
  game.picks.set(playerId, index);
  return index === correct ? "correct" : "wrong";
};

/**
 * Scores a correct guess by how fast it came and who got it first. Returns null if the player already scored this round.
 */
const recordSolve = (room, player) => {
  const game = room.game;
  if (hasSolved(room, player.id)) return null;
  const points = pointsFor(Date.now() - game.startedAt, game.musicMs, game.guessers.length);
  player.score += points;
  game.guessers.push({ id: player.id, name: player.name, points });
  return { points, answer: roundAnswer(game) };
};

/**
 * Whether every connected player has guessed it, or used their pick in multiple choice.
 */
const roundDone = (room) => {
  const game = room.game;
  if (game?.status !== "active" || game.round === 0) return false;
  const players = seatedPlayers(room).filter((p) => p.connected);
  const done = (p) => (game.mode === "choice" ? game.picks.has(p.id) : hasSolved(room, p.id));
  return players.length > 0 && players.every(done);
};

const computeResult = (room) => {
  const scores = seatedPlayers(room)
    .map(({ id, name, score }) => ({ id, name, score }))
    .sort((a, b) => b.score - a.score);
  const topScore = scores[0]?.score ?? 0;
  const top = scores.filter((p) => p.score === topScore);
  return {
    winner: topScore > 0 && top.length === 1 ? top[0].name : null,
    isTie: topScore > 0 && top.length > 1,
    topScore,
    maxScore: room.game.recap.length * MAX_POINTS,
    scores,
    recap: room.game.recap,
    daily: room.kind === "daily" ? room.dailyDate : null,
  };
};

/**
 * Ends the current round. Returns the reveal, plus the final result if that was the last round.
 * Otherwise the game takes a break, so nobody can score with the revealed answer.
 */
const finishRound = (room) => {
  const game = room.game;
  const song = currentSong(game);
  const reveal = {
    answer: song.song_name,
    artist: song.artist_name,
    artwork: song.song_artwork_url_100,
    artistUrl: song.artist_view_url,
    guessers: game.guessers,
  };
  game.recap.push(reveal);

  if (game.round < game.songs.length) {
    game.status = "break";
    return { reveal, result: null };
  }
  game.status = "over";
  return { reveal, result: computeResult(room) };
};

module.exports = {
  HINT_STAGES,
  SILENT_GUESS_MS,
  ROUND_BREAK_MS,
  normalizeText,
  judgeGuess,
  artistAnswers,
  pointsFor,
  maskAnswer,
  hintsFor,
  buildChoices,
  startGame,
  beginRound,
  roundPayload,
  revealHint,
  stopMusic,
  guessVerdict,
  pickOption,
  hasSolved,
  recordSolve,
  roundDone,
  finishRound,
};
