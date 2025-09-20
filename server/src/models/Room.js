// server/src/models/Room.js
const { v4: uuidv4 } = require('uuid');

class Room {
  constructor(type) {
    this.id = uuidv4().substring(0, 6).toUpperCase();
    this.type = type; // 'roulette' or 'poker'
    this.players = new Map();
    this.created = Date.now();
  }

  addPlayer(player) {
    this.players.set(player.id, player);
    player.currentRoom = this.id;
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
  }

  getPlayers() {
    return Array.from(this.players.values());
  }

  isEmpty() {
    return this.players.size === 0;
  }
}

module.exports = Room;
