const { test } = require("node:test");
const assert = require("node:assert");

const {
  createRoom,
  addPlayer,
  removePlayer,
  seatPlayers,
  ensureHost,
  applySettings,
  prepareForGame,
} = require("./roomService");

const join = (room, id) => addPlayer(room, { id, name: id, socketId: `socket-${id}` });

test("players past the seat limit spectate until a seat frees up", () => {
  const room = createRoom("seats", "party", "p0");
  for (let i = 0; i < 9; i++) join(room, `p${i}`);
  assert.strictEqual(room.players.get("p7").spectator, false);
  assert.strictEqual(room.players.get("p8").spectator, true);

  removePlayer(room, "p0");
  seatPlayers(room);
  assert.strictEqual(room.players.get("p8").spectator, false);
});

test("the host role passes on when the host leaves", () => {
  const room = createRoom("host", "party", "a");
  join(room, "a");
  join(room, "b");
  assert.strictEqual(ensureHost(room), null);
  room.players.get("a").connected = false;
  assert.strictEqual(ensureHost(room).id, "b");
  assert.strictEqual(room.hostId, "b");
});

test("reconnecting keeps your score; kicked players can't come back", () => {
  const room = createRoom("rejoin", "party", "a");
  join(room, "a");
  room.players.get("a").score = 5;
  room.players.get("a").connected = false;
  const again = addPlayer(room, { id: "a", name: "a", socketId: "new" });
  assert.strictEqual(again.rejoined, true);
  assert.strictEqual(again.previousSocketId, "socket-a");
  assert.strictEqual(again.player.score, 5);

  room.kicked.add("a");
  assert.ok(join(room, "a").error);
});

test("solo and daily rooms only fit one player", () => {
  const room = createRoom("solo", "solo", "a");
  join(room, "a");
  assert.strictEqual(join(room, "b").error, "Room is full");
});

test("only valid settings are applied", () => {
  const room = createRoom("settings", "party", "a");
  applySettings(room, { rounds: 20, mode: "choice", roundSeconds: 999, genre: "Nope" });
  assert.strictEqual(room.settings.rounds, 20);
  assert.strictEqual(room.settings.mode, "choice");
  assert.strictEqual(room.settings.roundSeconds, 15);
  assert.strictEqual(room.settings.genre, "any");
});

test("a new game drops players who left and resets scores", () => {
  const room = createRoom("reset", "party", "a");
  join(room, "a");
  join(room, "b");
  room.players.get("a").score = 4;
  room.players.get("b").connected = false;
  prepareForGame(room);
  assert.deepStrictEqual([...room.players.keys()], ["a"]);
  assert.strictEqual(room.players.get("a").score, 0);
});
