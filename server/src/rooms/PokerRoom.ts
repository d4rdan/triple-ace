// /server/src/rooms/PokerRoom.ts - Fixed property visibility
import { Room, Client } from 'colyseus';
import { Schema, type, MapSchema, ArraySchema } from '@colyseus/schema';

// Define the state classes
class Card extends Schema {
  @type('string') id: string = '';
  @type('string') suit: '♠' | '♥' | '♦' | '♣' = '♠';
  @type('string') rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' = '2';
  @type('number') value: number = 2;
}

class PokerPlayer extends Schema {
  @type('string') id: string = '';
  @type('string') name: string = '';
  @type('number') chips: number = 1000;
  @type([Card]) cards = new ArraySchema<Card>();
  @type('number') currentBet: number = 0;
  @type('boolean') folded: boolean = false;
  @type('boolean') allIn: boolean = false;
  @type('boolean') connected: boolean = true;
  @type('number') position: number = 0;
  @type('boolean') isDealer: boolean = false;
  @type('boolean') hasActed: boolean = false;
  @type('boolean') showCards: boolean = false;
}

class Winner extends Schema {
  @type('string') playerId: string = '';
  @type('string') playerName: string = '';
  @type('string') hand: string = '';
  @type('number') winAmount: number = 0;
}

class PokerState extends Schema {
  @type('string') gamePhase: 'waiting' | 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown' | 'finished' = 'waiting';
  @type({ map: PokerPlayer }) players = new MapSchema<PokerPlayer>();
  @type([Card]) communityCards = new ArraySchema<Card>();
  @type('number') pot: number = 0;
  @type('number') currentBet: number = 0;
  @type('string') currentTurn: string = '';
  @type('number') dealerPosition: number = 0;
  @type('number') smallBlind: number = 10;
  @type('number') bigBlind: number = 20;
  @type('number') round: number = 1;
  @type(Winner) winner?: Winner;
}

export class PokerRoom extends Room<PokerState> {
  // Make maxClients public to fix TypeScript error
  public maxClients = 8;
  
  private smallBlind = 10;
  private bigBlind = 20;
  private turnTimeLimit = 30000;
  private gameTimer?: NodeJS.Timeout;
  private turnTimer?: NodeJS.Timeout;

  onCreate(options: any) {
    console.log('[PokerRoom] Creating room');
    
    this.setState(new PokerState());
    this.autoDispose = true;
    
    // Initialize game state
    this.state.gamePhase = 'waiting';
    this.state.smallBlind = this.smallBlind;
    this.state.bigBlind = this.bigBlind;
    this.state.round = 1;
    this.state.pot = 0;
    this.state.currentBet = 0;
    this.state.dealerPosition = 0;

    console.log('[PokerRoom] Room created successfully');
  }

  onJoin(client: Client, options: any) {
    console.log(`[PokerRoom] Player joining: ${options.playerName || 'Unknown'}`);

    if (this.state.players.size >= this.maxClients) {
      throw new Error('Room is full');
    }

    if (this.state.gamePhase !== 'waiting') {
      throw new Error('Game already in progress');
    }

    // Create new player
    const player = new PokerPlayer();
    player.id = client.sessionId;
    player.name = options.playerName || `Player ${this.state.players.size + 1}`;
    player.chips = 1000;
    player.position = this.state.players.size;
    player.connected = true;

    // Set dealer for first player
    if (this.state.players.size === 0) {
      player.isDealer = true;
      this.state.dealerPosition = 0;
    }

    this.state.players.set(client.sessionId, player);

    // Notify other players
    this.broadcast('playerJoined', {
      player: {
        id: player.id,
        name: player.name,
        chips: player.chips,
        position: player.position
      }
    }, { except: client });

    console.log(`[PokerRoom] Player ${player.name} joined. Total: ${this.state.players.size}`);

    // Start game if we have enough players
    if (this.state.players.size >= 2 && this.state.gamePhase === 'waiting') {
      this.scheduleGameStart();
    }
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`[PokerRoom] Player ${client.sessionId} leaving`);

    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.connected = false;
      
      // If game is in progress, mark as folded
      if (this.state.gamePhase !== 'waiting' && this.state.gamePhase !== 'finished') {
        player.folded = true;
        
        // If it was their turn, move to next player
        if (this.state.currentTurn === client.sessionId) {
          this.nextTurn();
        }
      }

      // Notify other players
      this.broadcast('playerLeft', {
        player: { id: player.id, name: player.name }
      });

      // Remove player if game hasn't started
      if (this.state.gamePhase === 'waiting') {
        this.state.players.delete(client.sessionId);
      }
    }

    // End game if not enough players
    if (this.getActivePlayers().length < 2 && this.state.gamePhase !== 'waiting') {
      this.endGame('Not enough players');
    }
  }

  onMessage(client: Client, type: string, message: any) {
    console.log(`[PokerRoom] Message: ${type}`, message);

    const player = this.state.players.get(client.sessionId);
    if (!player || !player.connected) {
      return;
    }

    // Validate turn for game actions
    const gameActions = ['fold', 'check', 'call', 'raise', 'allIn'];
    if (gameActions.includes(type)) {
      if (this.state.currentTurn !== client.sessionId) {
        this.send(client, 'error', { message: 'Not your turn' });
        return;
      }

      if (player.folded || player.allIn) {
        this.send(client, 'error', { message: 'Cannot act - already folded or all-in' });
        return;
      }
    }

    switch (type) {
      case 'fold':
        this.handleFold(client.sessionId);
        break;
      case 'check':
        this.handleCheck(client.sessionId);
        break;
      case 'call':
        this.handleCall(client.sessionId);
        break;
      case 'raise':
        this.handleRaise(client.sessionId, message?.amount || 0);
        break;
      case 'allIn':
        this.handleAllIn(client.sessionId);
        break;
      default:
        console.warn(`[PokerRoom] Unknown message: ${type}`);
    }
  }

  private scheduleGameStart() {
    if (this.gameTimer) {
      clearTimeout(this.gameTimer);
    }

    console.log('[PokerRoom] Game starting in 3 seconds...');
    this.gameTimer = setTimeout(() => {
      this.startNewHand();
    }, 3000);
  }

  private startNewHand() {
    console.log('[PokerRoom] Starting new hand');

    // Reset players
    this.state.players.forEach(player => {
      player.cards.clear();
      player.currentBet = 0;
      player.folded = false;
      player.allIn = false;
      player.hasActed = false;
      player.showCards = false;
    });

    // Reset game state
    this.state.communityCards.clear();
    this.state.pot = 0;
    this.state.currentBet = 0;

    // Deal cards
    this.dealHoleCards();

    // Post blinds
    this.postBlinds();

    // Set game phase
    this.state.gamePhase = 'pre-flop';
    this.setFirstTurn();
    this.startTurnTimer();

    this.broadcast('gameStarted');
  }

  private dealHoleCards() {
    const deck = this.createDeck();
    let cardIndex = 0;

    this.state.players.forEach(player => {
      if (player.connected) {
        // Deal 2 cards to each player
        for (let i = 0; i < 2; i++) {
          player.cards.push(deck[cardIndex++]);
        }
      }
    });
  }

  private createDeck(): Card[] {
    const suits: Array<'♠' | '♥' | '♦' | '♣'> = ['♠', '♥', '♦', '♣'];
    const ranks: Array<'2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'> = 
      ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    const deck: Card[] = [];
    
    // Create all 52 cards
    for (const suit of suits) {
      for (const rank of ranks) {
        const card = new Card();
        card.id = `${suit}${rank}`;
        card.suit = suit;
        card.rank = rank;
        card.value = this.getRankValue(rank);
        deck.push(card);
      }
    }
    
    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
  }

  private getRankValue(rank: string): number {
    switch (rank) {
      case '2': return 2;
      case '3': return 3;
      case '4': return 4;
      case '5': return 5;
      case '6': return 6;
      case '7': return 7;
      case '8': return 8;
      case '9': return 9;
      case '10': return 10;
      case 'J': return 11;
      case 'Q': return 12;
      case 'K': return 13;
      case 'A': return 14;
      default: return 2;
    }
  }

  private postBlinds() {
    const players = this.getActivePlayers();
    if (players.length < 2) return;

    // Small blind
    const smallBlindPlayer = players[(this.state.dealerPosition + 1) % players.length];
    const smallBlindAmount = Math.min(this.smallBlind, smallBlindPlayer.chips);
    smallBlindPlayer.chips -= smallBlindAmount;
    smallBlindPlayer.currentBet = smallBlindAmount;
    this.state.pot += smallBlindAmount;

    // Big blind
    const bigBlindPlayer = players[(this.state.dealerPosition + 2) % players.length];
    const bigBlindAmount = Math.min(this.bigBlind, bigBlindPlayer.chips);
    bigBlindPlayer.chips -= bigBlindAmount;
    bigBlindPlayer.currentBet = bigBlindAmount;
    this.state.pot += bigBlindAmount;
    this.state.currentBet = bigBlindAmount;

    console.log(`[PokerRoom] Blinds posted: ${smallBlindPlayer.name} (${smallBlindAmount}), ${bigBlindPlayer.name} (${bigBlindAmount})`);
  }

  private setFirstTurn() {
    const players = this.getActivePlayers();
    if (players.length < 2) return;

    // First to act is after big blind
    const firstPlayerIndex = (this.state.dealerPosition + 3) % players.length;
    const firstPlayer = players[firstPlayerIndex];
    this.state.currentTurn = firstPlayer.id;

    console.log(`[PokerRoom] First turn: ${firstPlayer.name}`);
  }

  private handleFold(playerId: string) {
    const player = this.state.players.get(playerId);
    if (!player) return;

    player.folded = true;
    player.hasActed = true;

    console.log(`[PokerRoom] ${player.name} folded`);
    this.nextTurn();
  }

  private handleCheck(playerId: string) {
    const player = this.state.players.get(playerId);
    if (!player) return;

    if (this.state.currentBet !== player.currentBet) {
      const client = this.clients.find(c => c.sessionId === playerId);
      if (client) {
        this.send(client, 'error', { message: 'Cannot check - must call or raise' });
      }
      return;
    }

    player.hasActed = true;
    console.log(`[PokerRoom] ${player.name} checked`);
    this.nextTurn();
  }

  private handleCall(playerId: string) {
    const player = this.state.players.get(playerId);
    if (!player) return;

    const callAmount = this.state.currentBet - player.currentBet;
    if (callAmount <= 0) {
      this.handleCheck(playerId);
      return;
    }

    if (player.chips < callAmount) {
      // All-in call
      this.state.pot += player.chips;
      player.currentBet += player.chips;
      player.chips = 0;
      player.allIn = true;
    } else {
      // Normal call
      player.chips -= callAmount;
      player.currentBet = this.state.currentBet;
      this.state.pot += callAmount;
    }

    player.hasActed = true;
    console.log(`[PokerRoom] ${player.name} called ${callAmount}`);
    this.nextTurn();
  }

  private handleRaise(playerId: string, amount: number) {
    const player = this.state.players.get(playerId);
    if (!player) return;

    const totalBet = this.state.currentBet + amount;
    const additionalAmount = totalBet - player.currentBet;

    if (player.chips < additionalAmount) {
      const client = this.clients.find(c => c.sessionId === playerId);
      if (client) {
        this.send(client, 'error', { message: 'Not enough chips' });
      }
      return;
    }

    if (amount < this.bigBlind) {
      const client = this.clients.find(c => c.sessionId === playerId);
      if (client) {
        this.send(client, 'error', { message: `Minimum raise is ${this.bigBlind}` });
      }
      return;
    }

    player.chips -= additionalAmount;
    player.currentBet = totalBet;
    this.state.pot += additionalAmount;
    this.state.currentBet = totalBet;

    // Reset other players' hasActed status
    this.state.players.forEach(p => {
      if (p.id !== playerId && !p.folded) {
        p.hasActed = false;
      }
    });

    player.hasActed = true;
    console.log(`[PokerRoom] ${player.name} raised to ${totalBet}`);
    this.nextTurn();
  }

  private handleAllIn(playerId: string) {
    const player = this.state.players.get(playerId);
    if (!player) return;

    const allInAmount = player.chips;
    const newBet = player.currentBet + allInAmount;

    player.chips = 0;
    player.currentBet = newBet;
    player.allIn = true;
    player.hasActed = true;
    this.state.pot += allInAmount;

    if (newBet > this.state.currentBet) {
      this.state.currentBet = newBet;
      this.state.players.forEach(p => {
        if (p.id !== playerId && !p.folded) {
          p.hasActed = false;
        }
      });
    }

    console.log(`[PokerRoom] ${player.name} all-in with ${allInAmount}`);
    this.nextTurn();
  }

  private nextTurn() {
    this.clearTurnTimer();

    if (this.isBettingRoundComplete()) {
      this.nextPhase();
      return;
    }

    const players = this.getActivePlayers();
    const currentIndex = players.findIndex(p => p.id === this.state.currentTurn);
    let nextIndex = (currentIndex + 1) % players.length;

    let attempts = 0;
    while (attempts < players.length) {
      const nextPlayer = players[nextIndex];
      if (!nextPlayer.folded && !nextPlayer.allIn) {
        this.state.currentTurn = nextPlayer.id;
        this.startTurnTimer();
        return;
      }
      nextIndex = (nextIndex + 1) % players.length;
      attempts++;
    }

    this.nextPhase();
  }

  private isBettingRoundComplete(): boolean {
    const activePlayers = this.getActivePlayers().filter(p => !p.folded);
    
    if (activePlayers.length <= 1) return true;

    return activePlayers.every(p => 
      p.hasActed && (p.currentBet === this.state.currentBet || p.allIn)
    );
  }

  private nextPhase() {
    this.clearTurnTimer();

    // Reset for next betting round
    this.state.players.forEach(p => {
      p.hasActed = false;
      p.currentBet = 0;
    });
    this.state.currentBet = 0;

    switch (this.state.gamePhase) {
      case 'pre-flop':
        this.dealFlop();
        this.state.gamePhase = 'flop';
        break;
      case 'flop':
        this.dealTurn();
        this.state.gamePhase = 'turn';
        break;
      case 'turn':
        this.dealRiver();
        this.state.gamePhase = 'river';
        break;
      case 'river':
        this.showdown();
        return;
    }

    const players = this.getActivePlayers().filter(p => !p.folded);
    if (players.length > 1) {
      const firstPlayerIndex = (this.state.dealerPosition + 1) % players.length;
      this.state.currentTurn = players[firstPlayerIndex].id;
      this.startTurnTimer();
    } else {
      this.endHand();
    }
  }

  private dealFlop() {
    const deck = this.createDeck();
    const skipCards = this.getActivePlayers().length * 2;
    
    this.state.communityCards.push(deck[skipCards + 1]);
    this.state.communityCards.push(deck[skipCards + 2]);
    this.state.communityCards.push(deck[skipCards + 3]);
    
    console.log('[PokerRoom] Flop dealt');
  }

  private dealTurn() {
    const deck = this.createDeck();
    const skipCards = this.getActivePlayers().length * 2 + 4;
    this.state.communityCards.push(deck[skipCards]);
    console.log('[PokerRoom] Turn dealt');
  }

  private dealRiver() {
    const deck = this.createDeck();
    const skipCards = this.getActivePlayers().length * 2 + 6;
    this.state.communityCards.push(deck[skipCards]);
    console.log('[PokerRoom] River dealt');
  }

  private showdown() {
    console.log('[PokerRoom] Showdown');
    this.state.gamePhase = 'showdown';

    const activePlayers = this.getActivePlayers().filter(p => !p.folded);
    
    if (activePlayers.length === 1) {
      this.declareWinner(activePlayers[0]);
    } else {
      // Simple winner selection (first player wins for now)
      this.declareWinner(activePlayers[0], 'Best hand');
    }

    setTimeout(() => {
      this.endHand();
    }, 5000);
  }

  private declareWinner(winner: PokerPlayer, handDescription?: string) {
    winner.chips += this.state.pot;
    
    this.state.winner = {
      playerId: winner.id,
      playerName: winner.name,
      hand: handDescription || 'Best hand',
      winAmount: this.state.pot
    };

    this.broadcast('gameEnded', {
      winner: this.state.winner
    });

    console.log(`[PokerRoom] ${winner.name} wins ${this.state.pot} chips`);
  }

  private endHand() {
    this.state.gamePhase = 'waiting';
    this.state.round++;
    this.state.pot = 0;
    this.state.currentBet = 0;
    this.state.winner = undefined;

    // Move dealer button
    const players = this.getActivePlayers();
    if (players.length > 0) {
      this.state.dealerPosition = (this.state.dealerPosition + 1) % players.length;
      
      this.state.players.forEach(p => p.isDealer = false);
      players[this.state.dealerPosition].isDealer = true;
    }

    // Remove players with no chips
    const playersToRemove: string[] = [];
    this.state.players.forEach(player => {
      if (player.chips <= 0) {
        playersToRemove.push(player.id);
      }
    });

    playersToRemove.forEach(playerId => {
      this.state.players.delete(playerId);
      const client = this.clients.find(c => c.sessionId === playerId);
      if (client) {
        client.leave();
      }
    });

    // Start next hand if enough players
    if (this.getActivePlayers().length >= 2) {
      this.scheduleGameStart();
    }
  }

  private endGame(reason: string) {
    console.log(`[PokerRoom] Game ended: ${reason}`);
    this.state.gamePhase = 'finished';
    
    this.broadcast('gameEnded', { reason });
    
    setTimeout(() => {
      this.disconnect();
    }, 10000);
  }

  private getActivePlayers(): PokerPlayer[] {
    return Array.from(this.state.players.values()).filter(p => p.connected);
  }

  private startTurnTimer() {
    this.clearTurnTimer();
    
    this.turnTimer = setTimeout(() => {
      console.log(`[PokerRoom] Turn timeout for ${this.state.currentTurn}`);
      
      const player = this.state.players.get(this.state.currentTurn);
      if (player) {
        this.handleFold(this.state.currentTurn);
        this.broadcast('playerTimeout', { playerId: this.state.currentTurn });
      }
    }, this.turnTimeLimit);
  }

  private clearTurnTimer() {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
      this.turnTimer = undefined;
    }
  }

  onDispose() {
    console.log('[PokerRoom] Room disposing');
    this.clearTurnTimer();
    if (this.gameTimer) {
      clearTimeout(this.gameTimer);
    }
  }
}