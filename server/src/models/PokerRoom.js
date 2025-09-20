// server/src/models/PokerRoom.js
const Room = require('./Room');

class PokerRoom extends Room {
  constructor() {
    super('poker');
    this.gameState = {
      phase: 'WAITING', // WAITING, DEALING, BETTING, SHOWDOWN
      deck: [],
      communityCards: [],
      pot: 0,
      currentBet: 0,
      currentPlayer: 0,
      dealerPosition: 0
    };
  }

  initializeGame() {
    this.createDeck();
    this.gameState.phase = 'DEALING';
    this.gameState.pot = 0;
    this.gameState.currentBet = 0;
    this.gameState.dealerPosition = 0;
  }

  createDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    
    suits.forEach(suit => {
      ranks.forEach(rank => {
        deck.push({ suit, rank, id: `${rank}-${suit}` });
      });
    });
    
    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    this.gameState.deck = deck;
    this.gameState.communityCards = deck.slice(-5);
  }

  dealHoleCards() {
    let deckIndex = 0;
    this.players.forEach(player => {
      player.holeCards = [
        this.gameState.deck[deckIndex++],
        this.gameState.deck[deckIndex++]
      ];
      player.folded = false;
      player.currentBet = 0;
    });
  }

  addToPot(amount) {
    this.gameState.pot += amount;
  }

  setCurrentBet(amount) {
    this.gameState.currentBet = amount;
  }
}

module.exports = PokerRoom;