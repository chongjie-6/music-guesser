/**
 * Helper function to check if a room with the given ID exists
 * @param {String} roomID Id of the room to check
 * @param {Object} io Socket.io server instance
 * @returns Boolean indicating whether the room exists
 */
const checkRoomExists = (roomID, io) => {
  const room = io.sockets.adapter.rooms.get(roomID);
  console.log("Checking room existence:", roomID, room);
  return room !== undefined;
};

/**
 * Helper function to check if a room with the given ID has reached max players
 * @param {String} roomID Id of the room to check
 * @param {Object} io Socket.io server instance
 * @param {Number} maxPlayers Maximum number of players allowed in the room
 * @returns Boolean indicating whether the room exists
 */
const checkMaxPlayersReached = (roomID, io, maxPlayers = 4) => {
  const playerCount = io.sockets.adapter.rooms.get(roomID)?.size;
  console.log("Checking max players for room:", roomID, playerCount);
  return playerCount >= maxPlayers;
};

/**
 * Helper function to check if a room with the given ID has any players
 * @param {Object} io Socket.io server instance
 * @returns Boolean indicating whether the room has any players
 */
const checkIfAnyPlayerExists = (roomID, io) => {
  const playerCount = io.sockets.adapter.rooms.get(roomID)?.size;
  return playerCount != 0;
};

module.exports = {
  checkRoomExists,
  checkMaxPlayersReached,
  checkIfAnyPlayerExists,
};
