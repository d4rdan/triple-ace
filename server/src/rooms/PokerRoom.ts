// server/src/rooms/PokerRoom.ts

import { Room, Client } from 'colyseus';
import { Schema, type, MapSchema, ArraySchema } from '@colyseus/schema';

// Card schema
export class Card extends Schema {
  @type('string') suit: string;
  @type('string') rank: string;
  @type('number') value: number;

  constructor(suit: string, rank: string, value: number) {
    super();
    this.suit = suit;
    this.rank = rank;
    this.value = value;
  }
}

// Player schema
export class Player extends Schema {
  @type('string') id: string;
  @type('string') name: string;
  @type('number') chips: number;
  @type('number') currentBet: number;
  @type('boolean') isActive: boolean;
  @type('boolean') isFolded: boolean;
  @type('boolean') isAllIn: boolean;
  @type('number') position: number;
  @type([Card]) hand = new ArraySchema<Card>();
  @type('string') lastAction: string;

  constructor(id: string, name: string, position: number) {
    super();
    this.id = id;
    this.name = name;
    this.chips = 1000; // Starting chips
    this.currentBet = 0;
    this.isActive = true;
    this.isFolded = false;
    this.isAllIn = false;
    this.position = position;
    this.lastAction = '';
  }
}

// Game state schema
export class PokerState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type([Card]) communityCards = new ArraySchema<Card>();
  @type('number') pot: number = 0;
  @type('number') currentBet: number = 0;
  @type('string') currentPlayer: string = '';
  @type('string') phase: string = 'waiting'; // waiting, pre-flop, flop, turn, river, showdown
  @type('number') dealerPosition: number = 0;
  @type('number') smallBlind: number = 10;
  @type('number') bigBlind: number = 20;
  @type('string') message: string = '';
  @type('boolean') gameStarted: boolean = false;
  @type('number') roundNumber: number = 0;
}

export class PokerRoom extends Room<PokerState> {
  private deck: Card[] = [];
  private playerOrder: string[] = [];
  private currentPlayerIndex: number = 0;
  private actionCount: number = 0;

  onCreate(options: any) {
    this.setState(new PokerState());
    this.maxClients = 4;
    
    console.log('Poker room created with options:', options);
    this.state.message = 'Waiting for players...';

    // Handle player actions
    this.onMessage('player-action', (client, message) => {
      this.handlePlayerAction(client, message);
    });

    this.onMessage('start-game', (client) => {
      this.startGame();
    });
  }

  onJoin(client: Client, options: any) {
    console.log(`Player ${client.sessionId} joined poker room`);
    
    const playerName = options.name || `Player ${this.clients.length}`;
    const position = this.clients.length - 1;
    
    const player = new Player(client.sessionId, playerName, position);
    this.state.players.set(client.sessionId, player);
    
    this.state.message = `${playerName} joined the game (${this.clients.length}/4 players)`;
    
    // Auto-start game when we have at least 2 players
    if (this.clients.length >= 2 && !this.state.gameStarted) {
      setTimeout(() => {
        this.startGame();
      }, 2000);
    }
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`Player ${client.sessionId} left poker room`);
    
    const player = this.state.players.get(client.sessionId);
    if (player) {
      this.state.message = `${player.name} left the game`;
      this.state.players.delete(client.sessionId);
      
      // Remove from player order
      this.playerOrder = this.playerOrder.filter(id => id !== client.sessionId);
      
      // If game is in progress and player was current player, advance turn
      if (this.state.gameStarted && this.state.currentPlayer === client.sessionId) {
        this.nextPlayer();
      }
      
      // End game if not enough players
      if (this.clients.length < 2 && this.state.gameStarted) {
        this.endGame();
      }
    }
  }

  private startGame() {
    if (this.clients.length < 2) return;
    
    this.state.gameStarted = true;
    this.state.roundNumber++;
    this.state.phase = 'pre-flop';
    this.state.pot = 0;
    this.state.currentBet = this.state.bigBlind;
    
    // Reset all players
    this.state.players.forEach(player => {
      player.currentBet = 0;
      player.isFolded = false;
      player.isAllIn = false;
      player.lastAction = '';
      player.hand.clear();
    });
    
    // Set up player order
    this.playerOrder = Array.from(this.state.players.keys());
    
    // Create and shuffle deck
    this.createDeck();
    this.shuffleDeck();
    
    // Deal hole cards
    this.dealHoleCards();
    
    // Post blinds
    this.postBlinds();
    
    // Set first player to act (after big blind)
    this.currentPlayerIndex = (this.state.dealerPosition + 3) % this.playerOrder.length;
    this.state.currentPlayer = this.playerOrder[this.currentPlayerIndex];
    
    this.state.message = 'Game started! Betting round begins.';
    this.state.communityCards.clear();
    this.actionCount = 0;
  }

  private createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    
    this.deck = [];
    for (let i = 0; i < suits.length; i++) {
      for (let j = 0; j < ranks.length; j++) {
        this.deck.push(new Card(suits[i], ranks[j], values[j]));
      }
    }
  }

  private shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  private dealHoleCards() {
    // Deal 2 cards to each player
    for (let i = 0; i < 2; i++) {
      this.playerOrder.forEach(playerId => {
        const player = this.state.players.get(playerId);
        if (player && this.deck.length > 0) {
          player.hand.push(this.deck.pop()!);
        }
      });
    }
  }

  private postBlinds() {
    const smallBlindPos = (this.state.dealerPosition + 1) % this.playerOrder.length;
    const bigBlindPos = (this.state.dealerPosition + 2) % this.playerOrder.length;
    
    const smallBlindPlayer = this.state.players.get(this.playerOrder[smallBlindPos]);
    const bigBlindPlayer = this.state.players.get(this.playerOrder[bigBlindPos]);
    
    if (smallBlindPlayer) {
      smallBlindPlayer.currentBet = this.state.smallBlind;
      smallBlindPlayer.chips -= this.state.smallBlind;
      smallBlindPlayer.lastAction = `Small Blind (${this.state.smallBlind})`;
      this.state.pot += this.state.smallBlind;
    }
    
    if (bigBlindPlayer) {
      bigBlindPlayer.currentBet = this.state.bigBlind;
      bigBlindPlayer.chips -= this.state.bigBlind;
      bigBlindPlayer.lastAction = `Big Blind (${this.state.bigBlind})`;
      this.state.pot += this.state.bigBlind;
    }
  }

  private handlePlayerAction(client: Client, action: any) {
    const player = this.state.players.get(client.sessionId);
    if (!player || client.sessionId !== this.state.currentPlayer || player.isFolded) {
      return;
    }

    switch (action.type) {
      case 'fold':
        player.isFolded = true;
        player.lastAction = 'Fold';
        break;
        
      case 'call':
        const callAmount = this.state.currentBet - player.currentBet;
        const actualCall = Math.min(callAmount, player.chips);
        player.chips -= actualCall;
        player.currentBet += actualCall;
        this.state.pot += actualCall;
        player.lastAction = actualCall === callAmount ? 'Call' : 'All-in';
        if (player.chips === 0) player.isAllIn = true;
        break;
        
      case 'raise':
        const raiseAmount = Math.min(action.amount, player.chips);
        const totalBet = this.state.currentBet + raiseAmount;
        const toBet = totalBet - player.currentBet;
        player.chips -= toBet;
        player.currentBet = totalBet;
        this.state.pot += toBet;
        this.state.currentBet = totalBet;
        player.lastAction = `Raise to ${totalBet}`;
        if (player.chips === 0) player.isAllIn = true;
        break;
        
      case 'check':
        player.lastAction = 'Check';
        break;
    }

    this.actionCount++;
    this.nextPlayer();
  }

  private nextPlayer() {
    let attempts = 0;
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.playerOrder.length;
      attempts++;
    } while (
      attempts < this.playerOrder.length && 
      (this.state.players.get(this.playerOrder[this.currentPlayerIndex])?.isFolded || 
       this.state.players.get(this.playerOrder[this.currentPlayerIndex])?.isAllIn)
    );

    // Check if betting round is complete
    if (this.isBettingRoundComplete()) {
      this.nextPhase();
    } else {
      this.state.currentPlayer = this.playerOrder[this.currentPlayerIndex];
    }
  }

  private isBettingRoundComplete(): boolean {
    const activePlayers = Array.from(this.state.players.values()).filter(p => !p.isFolded);
    
    // If only one player left, round is complete
    if (activePlayers.length <= 1) return true;
    
    // Check if all active players have made the same bet or are all-in
    const playersNeedingAction = activePlayers.filter(p => 
      !p.isAllIn && p.currentBet < this.state.currentBet
    );
    
    return playersNeedingAction.length === 0 && this.actionCount >= activePlayers.length;
  }

  private nextPhase() {
    this.actionCount = 0;
    this.state.currentBet = 0;
    
    // Reset player bets for next round
    this.state.players.forEach(player => {
      player.currentBet = 0;
    });

    switch (this.state.phase) {
      case 'pre-flop':
        this.state.phase = 'flop';
        this.dealFlop();
        break;
      case 'flop':
        this.state.phase = 'turn';
        this.dealTurn();
        break;
      case 'turn':
        this.state.phase = 'river';
        this.dealRiver();
        break;
      case 'river':
        this.state.phase = 'showdown';
        this.showdown();
        return;
    }
    
    // Start next betting round with player after dealer
    this.currentPlayerIndex = (this.state.dealerPosition + 1) % this.playerOrder.length;
    this.findNextActivePlayer();
  }

  private findNextActivePlayer() {
    let attempts = 0;
    while (attempts < this.playerOrder.length) {
      const player = this.state.players.get(this.playerOrder[this.currentPlayerIndex]);
      if (player && !player.isFolded && !player.isAllIn) {
        this.state.currentPlayer = this.playerOrder[this.currentPlayerIndex];
        return;
      }
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.playerOrder.length;
      attempts++;
    }
    
    // No active players, go to showdown
    this.nextPhase();
  }

  private dealFlop() {
    // Burn one card, then deal 3 community cards
    this.deck.pop();
    for (let i = 0; i < 3; i++) {
      if (this.deck.length > 0) {
        this.state.communityCards.push(this.deck.pop()!);
      }
    }
    this.state.message = 'Flop dealt!';
  }

  private dealTurn() {
    // Burn one card, then deal 1 community card
    this.deck.pop();
    if (this.deck.length > 0) {
      this.state.communityCards.push(this.deck.pop()!);
    }
    this.state.message = 'Turn dealt!';
  }

  private dealRiver() {
    // Burn one card, then deal 1 community card
    this.deck.pop();
    if (this.deck.length > 0) {
      this.state.communityCards.push(this.deck.pop()!);
    }
    this.state.message = 'River dealt!';
  }

  private showdown() {
    const activePlayers = Array.from(this.state.players.values()).filter(p => !p.isFolded);
    
    if (activePlayers.length === 1) {
      // Only one player left, they win
      const winner = activePlayers[0];
      winner.chips += this.state.pot;
      this.state.message = `${winner.name} wins ${this.state.pot} chips!`;
    } else {
      // Multiple players, determine winner (simplified - just random for now)
      const winner = activePlayers[Math.floor(Math.random() * activePlayers.length)];
      winner.chips += this.state.pot;
      this.state.message = `${winner.name} wins ${this.state.pot} chips!`;
    }
    
    // Reset for next hand
    setTimeout(() => {
      this.state.dealerPosition = (this.state.dealerPosition + 1) % this.playerOrder.length;
      this.startGame();
    }, 5000);
  }

  private endGame() {
    this.state.gameStarted = false;
    this.state.phase = 'waiting';
    this.state.message = 'Game ended. Waiting for more players...';
  }
}