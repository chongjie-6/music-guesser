const { test } = require("node:test");
const assert = require("node:assert");

const TITLES = ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel", "India", "Juliet", "Kilo", "Lima"];
const song = (i) => ({
  song_id: String(i),
  song_name: TITLES[i - 1],
  artist_name: `Artist ${i}`,
  genre_name: "Pop",
  released_on: "2019-11-29",
});
const library = Array.from({ length: 12 }, (_, i) => song(i + 1));
require.cache[require.resolve("./songService")] = {
  loaded: true,
  exports: {
    ERAS: {},
    currentGenres: () => [],
    getSongs: async ({ count, excludeIds = [] }) =>
      library.filter((s) => !excludeIds.includes(s.song_id)).slice(0, count),
  },
};

const {
  normalizeText,
  judgeGuess,
  artistAnswers,
  pointsFor,
  maskAnswer,
  hintsFor,
  buildChoices,
  startGame,
  beginRound,
  guessVerdict,
  pickOption,
  recordSolve,
  roundDone,
  finishRound,
} = require("./gameService");
const { createRoom, addPlayer } = require("./roomService");

const newRoom = (id, settings = {}) => {
  const room = createRoom(id, "party", "a");
  Object.assign(room.settings, settings);
  addPlayer(room, { id: "a", name: "Ann", socketId: "sa" });
  addPlayer(room, { id: "b", name: "Bob", socketId: "sb" });
  return room;
};

test("normalizeText", () => {
  assert.strictEqual(normalizeText("Señorita"), "senorita");
  assert.strictEqual(normalizeText("Starboy (feat. Daft Punk)"), "starboy");
  assert.strictEqual(normalizeText("Here Comes the Sun - Remastered 2009"), "herecomesthesun");
  assert.strictEqual(normalizeText("(Untitled)"), "untitled");
  assert.notStrictEqual(normalizeText("夜に駆ける"), "");
  assert.strictEqual(normalizeText("?!"), "");
});

test("judgeGuess forgives small typos and flags guesses that give the answer away", () => {
  assert.strictEqual(judgeGuess("blinding lights", ["Blinding Lights"]), "correct");
  assert.strictEqual(judgeGuess("blindin lihts", ["Blinding Lights"]), "correct");
  assert.strictEqual(judgeGuess("blinding", ["Blinding Lights"]), "close");
  assert.strictEqual(judgeGuess("is it blinding lights?", ["Blinding Lights"]), "close");
  assert.strictEqual(judgeGuess("starboy", ["Blinding Lights"]), null);
  // Short titles need an exact match
  assert.strictEqual(judgeGuess("stay", ["Stay"]), "correct");
  assert.strictEqual(judgeGuess("stan", ["Stay"]), null);
  assert.strictEqual(judgeGuess("lol", ["Lose"]), null);
});

test("artist mode accepts any credited artist", () => {
  const answers = artistAnswers("Post Malone & Swae Lee");
  assert.strictEqual(judgeGuess("post malone", answers), "correct");
  assert.strictEqual(judgeGuess("swae lee", answers), "correct");
});

test("faster guesses score more", () => {
  assert.strictEqual(pointsFor(4000, 15000), 3);
  assert.strictEqual(pointsFor(14000, 15000), 2);
  assert.strictEqual(pointsFor(17000, 15000), 1);
});

test("hints are revealed one stage at a time", () => {
  const s = { ...song(1), song_name: "Blinding Lights (Remix)" };
  assert.deepStrictEqual(hintsFor(s, "title", 0), { year: "2019" });
  assert.deepStrictEqual(Object.keys(hintsFor(s, "title", 3)), ["year", "genre", "artist", "letters"]);
  assert.strictEqual(hintsFor(s, "title", 3).letters, "B_______ L_____");
  assert.strictEqual(hintsFor(s, "artist", 3).artist, undefined);
  assert.strictEqual(hintsFor(s, "artist", 3).letters, "A_____ 1");
  assert.strictEqual(hintsFor(s, "choice", 3).letters, undefined);
  assert.strictEqual(hintsFor(s, "choice", 3).artist, undefined);
  assert.strictEqual(maskAnswer("Don't Start Now"), "D__'_ S____ N__");
});

test("multiple choice has four distinct options including the answer", () => {
  const songs = library.slice(0, 5);
  for (const { options, correct } of buildChoices(songs, library)) {
    assert.strictEqual(options.length, 4);
    assert.strictEqual(new Set(options).size, 4);
    assert.ok(correct >= 0);
  }
  const [{ options, correct }] = buildChoices(songs, library);
  assert.ok(songs.some((s) => s.song_name === options[correct]));
  // Decoys never include another round's answer
  const answers = new Set(songs.map((s) => s.song_name));
  assert.ok(options.every((o, i) => i === correct || !answers.has(o)));
});

test("everyone can score once per round, and the round waits for every connected player", async () => {
  const room = newRoom("race");
  const [ann, bob] = room.players.values();
  await startGame(room);
  beginRound(room);
  assert.strictEqual(guessVerdict(room, "alpha"), "correct");
  assert.deepStrictEqual(recordSolve(room, ann), { points: 3, answer: "Alpha" });
  assert.strictEqual(recordSolve(room, ann), null);
  assert.strictEqual(roundDone(room), false);

  bob.connected = false;
  assert.strictEqual(roundDone(room), true);
  bob.connected = true;
  recordSolve(room, bob);
  assert.strictEqual(roundDone(room), true);
  assert.deepStrictEqual(finishRound(room).reveal.guessers.map((g) => g.name), ["Ann", "Bob"]);
  assert.strictEqual(ann.score + bob.score, 6);
});

test("a round never counts as done with nobody connected", async () => {
  const room = newRoom("empty");
  await startGame(room);
  beginRound(room);
  for (const p of room.players.values()) p.connected = false;
  assert.strictEqual(roundDone(room), false);
});

test("multiple choice finishes once everyone has picked, right or wrong", async () => {
  const room = newRoom("choice", { mode: "choice", rounds: 5 });
  await startGame(room);
  beginRound(room);
  const { correct, options } = room.game.choices[0];
  assert.strictEqual(pickOption(room, "a", correct), "correct");
  assert.strictEqual(pickOption(room, "a", correct), null);
  assert.strictEqual(roundDone(room), false);
  assert.strictEqual(pickOption(room, "b", (correct + 1) % options.length), "wrong");
  assert.strictEqual(roundDone(room), true);
});

test("game ends after the last round with everyone on the scoreboard", async () => {
  const room = newRoom("end", { rounds: 5 });
  await startGame(room);
  for (let i = 0; i < 4; i++) {
    beginRound(room);
    assert.strictEqual(finishRound(room).result, null);
  }
  beginRound(room);
  const { result } = finishRound(room);
  assert.strictEqual(result.winner, null);
  assert.strictEqual(result.isTie, false);
  assert.deepStrictEqual(result.scores.map((p) => p.name), ["Ann", "Bob"]);
  assert.strictEqual(result.recap.length, 5);
  assert.strictEqual(room.game.status, "over");
});

test("songs don't repeat in a room until the library runs out", async () => {
  const room = newRoom("repeat", { rounds: 5 });
  await startGame(room);
  const first = room.game.songs.map((s) => s.song_id);
  await startGame(room);
  const second = room.game.songs.map((s) => s.song_id);
  assert.ok(!second.some((id) => first.includes(id)));
  // Only 2 unplayed songs left, so the cycle starts again
  await startGame(room);
  assert.strictEqual(room.game.songs.length, 5);
});
