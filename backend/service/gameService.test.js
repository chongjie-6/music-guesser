const { test } = require("node:test");
const assert = require("node:assert");

const songs = Array.from({ length: 10 }, (_, i) => ({ song_name: `Song ${i + 1}` }));
require.cache[require.resolve("./songService")] = {
  loaded: true,
  exports: { getRandomSongs: async () => songs },
};

const {
  normalizeText,
  startRoomGame,
  submitGuess,
  skipRound,
  isGameRunning,
} = require("./gameService");

test("normalizeText", () => {
  assert.strictEqual(normalizeText("Señorita"), "senorita");
  assert.strictEqual(normalizeText("Starboy (feat. Daft Punk)"), "starboy");
  assert.strictEqual(normalizeText("Here Comes the Sun - Remastered 2009"), "herecomesthesun");
  assert.notStrictEqual(normalizeText("夜に駆ける"), "");
  assert.strictEqual(normalizeText("?!"), "");
});

test("simultaneous correct guesses only score once", async () => {
  await startRoomGame("race");
  const first = submitGuess({ roomId: "race", userId: "a", userName: "Anon", guess: "song 1" });
  const second = submitGuess({ roomId: "race", userId: "b", userName: "Anon", guess: "Song 1" });

  assert.strictEqual(first.nextRound.round, 2);
  assert.strictEqual(second, null);
  assert.deepStrictEqual(first.nextRound.scores, [{ id: "a", name: "Anon", score: 1 }]);
});

test("players with the same name keep separate scores", async () => {
  await startRoomGame("names");
  submitGuess({ roomId: "names", userId: "a", userName: "Anon", guess: "Song 1" });
  const result = submitGuess({ roomId: "names", userId: "b", userName: "Anon", guess: "Song 2" });

  assert.strictEqual(result.nextRound.scores.length, 2);
});

test("game ends after the last round", async () => {
  await startRoomGame("end");
  for (let i = 0; i < 9; i++) assert.strictEqual(skipRound("end").gameOver, false);

  const last = skipRound("end");
  assert.strictEqual(last.gameOver, true);
  assert.deepStrictEqual(last.result, { winner: null, scores: [], isTie: false, topScore: 0 });
  assert.strictEqual(isGameRunning("end"), false);
  assert.strictEqual(skipRound("end"), null);
});
