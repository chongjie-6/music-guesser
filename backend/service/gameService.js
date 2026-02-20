const { createClient } = require("./spotifyService");

const MAX_LIMIT = 10;
const MAX_OFFSET = 2;
const songsByRoom = new Map();

const QUERIES = [
  "genre:pop year:2010-2020",
  // "genre:pop year:2010-2020",
  // "genre:pop year:2000-2010",
  // "genre:dance-pop year:2010-2020",
  // "genre:indie-pop year:2010-2020",
];

const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\(\[（［][^)\]）］]*[\)\]）］]|[^\w\s]/g, "")
    .trim()
    .replace(/[^a-z0-9]/g, "");

const getRandomQuery = () => {
  return encodeURIComponent(
    QUERIES[Math.floor(Math.random() * QUERIES.length)],
  );
};

const buildPublicRound = (song, round) => ({
  round,
  previewUrl: song.previewUrl,
  artistName: song.artistName,
  primaryGenreName: song.primaryGenreName,
  releaseDate: song.releaseDate,
});

const getRandomSong = async () => {
  const query = getRandomQuery();
  const token = await createClient();

  const random_offset = Math.floor(Math.random() * MAX_OFFSET);
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${query}&type=track&limit=${MAX_LIMIT}&offset=${random_offset}&market=US`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  const tracksJSON = await response.json();
  const tracks = tracksJSON.tracks.items;

  if (!tracks.length) throw new Error("No tracks found on selected page");

  const picked = tracks[Math.floor(Math.random() * tracks.length)];

  const song_name = picked?.name ?? "";
  const artist = (picked?.artists ?? []).map((a) => a.name).join(" ") || "";

  if (!song_name) throw new Error("Picked track missing name");

  const itunesTerm = encodeURIComponent(`${song_name} ${artist}`.trim());
  const song_response = await fetch(
    `https://itunes.apple.com/search?term=${itunesTerm}&entity=song&limit=20&country=US`,
  );

  if (!song_response.ok) {
    const text = await song_response.text();
    throw new Error(`iTunes search failed (${song_response.status}): ${text}`);
  }

  const song_data = await song_response.json();
  const results = song_data?.results ?? [];

  if (!results.length) {
    throw new Error("Could not find iTunes matches for this track");
  }
  const best = results.find((r) => r.previewUrl) ?? results[0];

  return best;
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
  if (!game?.isActive) return { status: "inactive" };

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
