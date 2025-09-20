// server/src/models/RouletteRoom.js
const Room = require('./Room');

class RouletteRoom extends Room {
  constructor() {
    super('roulette');
    this.gameState = {
      phase: 'BETTING', // BETTING, SPINNING, RESULTS
      bets: new Map(),
      winningNumber: null,
      timer: 30
    };
  }

  addBet(playerId, bet) {
    if (!this.gameState.bets.has(playerId)) {
      this.gameState.bets.set(playerId, []);
    }
    this.gameState.bets.get(playerId).push(bet);
  }

  clearBets() {
    this.gameState.bets.clear();
  }

  setPhase(phase) {
    this.gameState.phase = phase;
  }

  setWinningNumber(number) {
    this.gameState.winningNumber = number;
  }
}

module.exports = RouletteRoom;