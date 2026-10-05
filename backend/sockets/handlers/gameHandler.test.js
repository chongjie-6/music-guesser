const { test, mock } = require("node:test");
const assert = require("node:assert");

const songs = Array.from({ length: 10 }, (_, i) => ({ song_name: `Song ${i + 1}` }));
require.cache[require.resolve("../../service/songService")] = {
  loaded: true,
  exports: { getRandomSongs: async () => songs },
};

const { startRoomGame } = require("../../service/gameService");
const { continueGame, clearRoomTimer } = require("./gameHandler");

test("music stops after 15s, round skips 5s later, and a guess in between cancels the skip", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const events = [];
  const io = { in: () => ({ emit: (event) => events.push(event) }) };

  await startRoomGame("timer");
  continueGame(io, "timer", { gameOver: false, nextRound: {} });

  mock.timers.tick(14999);
  assert.deepStrictEqual(events, ["game-next-round"]);
  mock.timers.tick(1);
  assert.deepStrictEqual(events, ["game-next-round", "game-music-stop"]);
  mock.timers.tick(4999);
  assert.strictEqual(events.length, 2);
  mock.timers.tick(1);
  assert.deepStrictEqual(events.slice(2), ["skipped-round", "game-next-round"]);

  mock.timers.tick(15000);
  clearRoomTimer("timer");
  mock.timers.tick(5000);
  assert.deepStrictEqual(events.slice(4), ["game-music-stop"]);

  mock.timers.reset();
});
