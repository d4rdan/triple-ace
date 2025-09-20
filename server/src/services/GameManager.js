// server/src/services/GameManager.js
const RouletteRoom = require('../models/RouletteRoom');
const PokerRoom = require('../models/PokerRoom');

class GameManager {
  constructor() {
    this.rooms = new Map(); // roomId -> Room
    this.players = new Map(); // socketId -> Player
  }

  addPlayer(player) {
    this.players.set(player.id, player);
  }

  removePlayer(playerId) {
    const player = this.players.get(playerId);
    if (player && player.currentRoom) {
      const room = this.rooms.get(player.currentRoom);
      if (room) {
        room.removePlayer(playerId);
        if (room.isEmpty()) {
          this.rooms.delete(player.currentRoom);
        }
      }
    }
    this.players.delete(playerId);
  }

  getPlayer(playerId) {
    return this.players.get(playerId);
  }

  createOrJoinRouletteRoom(roomCode = null) {
    let room;
    
    if (roomCode && this.rooms.has(roomCode)) {
      room = this.rooms.get(roomCode);
    } else {
      room = new RouletteRoom();
      this.rooms.set(room.id, room);
    }
    
    return room;
  }

  createOrJoinPokerRoom(roomCode = null) {
    let room;
    
    if (roomCode && this.rooms.has(roomCode)) {
      room = this.rooms.get(roomCode);
    } else {
      room = new PokerRoom();
      this.rooms.set(room.id, room);
    }
    
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }
}

module.exports = new GameManager();