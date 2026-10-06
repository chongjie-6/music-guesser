const { test, mock } = require("node:test");
const assert = require("node:assert");

const songs = Array.from({ length: 10 }, (_, i) => ({ song_id: String(i), song_name: `Song ${i + 1}` }));
require.cache[require.resolve("../../service/songService")] = {
  loaded: true,
  exports: { ERAS: {}, currentGenres: () => [], getSongs: async () => songs },
};

const { createRoom, addPlayer } = require("../../service/roomService");
const { startGame, guessVerdict } = require("../../service/gameService");
const { startRound, solve, clearRoomTimer } = require("./gameHandler");

const fakeIo = (events) => ({
  in: () => ({ emit: (event) => events.push(event) }),
  to: () => ({ emit: (event) => events.push(`to:${event}`) }),
});

const newRoom = async (id) => {
  const room = createRoom(id, "party", "a");
  addPlayer(room, { id: "a", name: "Ann", socketId: "sa" });
  addPlayer(room, { id: "b", name: "Bob", socketId: "sb" });
  await startGame(room);
  return room;
};

test("hints every quarter, music stops at 15s, round ends 5s later, next starts 5s after", async () => {
  mock.timers.enable({ apis: ["setTimeout", "Date"] });
  const events = [];
  const room = await newRoom("timer");

  startRound(fakeIo(events), room);
  for (let i = 0; i < 3; i++) mock.timers.tick(3750);
  assert.deepStrictEqual(events, ["game-round", "room-state", "game-hint", "game-hint", "game-hint"]);
  mock.timers.tick(3749);
  assert.strictEqual(events.length, 5);
  mock.timers.tick(1);
  assert.strictEqual(events.at(-1), "game-music-stop");
  mock.timers.tick(5000);
  assert.deepStrictEqual(events.slice(6), ["round-end", "newMessage"]);
  // The answer is out during the break, so it can't score
  assert.strictEqual(guessVerdict(room, "Song 1"), null);
  mock.timers.tick(5000);
  assert.deepStrictEqual(events.slice(8), ["game-round", "room-state"]);
  assert.strictEqual(room.game.round, 2);

  clearRoomTimer(room);
  mock.timers.reset();
});

test("a correct guess keeps the round going until everyone has it", async () => {
  mock.timers.enable({ apis: ["setTimeout", "Date"] });
  const events = [];
  const io = fakeIo(events);
  const room = await newRoom("solve");
  const [ann, bob] = room.players.values();

  startRound(io, room);
  events.length = 0;
  solve(io, room, ann);
  assert.deepStrictEqual(events, ["to:guess-result", "newMessage", "room-state"]);
  assert.strictEqual(room.game.round, 1);

  mock.timers.tick(6000);
  solve(io, room, bob);
  assert.ok(events.includes("round-end"));
  mock.timers.tick(5000);
  assert.strictEqual(room.game.round, 2);
  assert.deepStrictEqual([ann.score, bob.score], [1000, 650]);

  clearRoomTimer(room);
  mock.timers.reset();
});
