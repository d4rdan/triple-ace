// /client/src/components/poker/types/index.ts
export interface Card {
    id: string;
    suit: '♠' | '♥' | '♦' | '♣';
    rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
    value: number;
  }
  
  export interface PokerPlayer {
    id: string;
    name: string;
    chips: number;
    cards: Card[];
    currentBet: number;
    folded: boolean;
    allIn: boolean;
    connected: boolean;
    position: number;
    isDealer: boolean;
    hasActed: boolean;
    showCards: boolean;
  }
  
  export interface PokerGameState {
    gamePhase: 'waiting' | 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown' | 'finished';
    players: Map<string, PokerPlayer>;
    communityCards: Card[];
    pot: number;
    currentBet: number;
    currentTurn: string;
    dealerPosition: number;
    smallBlind: number;
    bigBlind: number;
    round: number;
    winner?: {
      playerId: string;
      playerName: string;
      hand: string;
      winAmount: number;
    };
  }
  
  export interface HandResult {
    strength: number;
    description: string;
    cards: Card[];
  }
  
  export interface BettingAction {
    type: 'fold' | 'check' | 'call' | 'raise' | 'allIn';
    amount?: number;
    playerId: string;
    playerName: string;
    timestamp: number;
  }
  
  export interface GameSettings {
    smallBlind: number;
    bigBlind: number;
    startingChips: number;
    maxPlayers: number;
    turnTimeLimit: number;
  }
  
  export interface RoomInfo {
    id: string;
    players: number;
    maxPlayers: number;
    gamePhase: string;
    smallBlind: number;
    bigBlind: number;
    isPrivate: boolean;
  }
  
  export type GamePhase = 'waiting' | 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown' | 'finished';
  
  export type PlayerAction = 'fold' | 'check' | 'call' | 'raise' | 'allIn';
  
  export interface SocketMessage {
    type: string;
    data?: any;
    timestamp: number;
  }
  
  export interface ConnectionState {
    isConnecting: boolean;
    isConnected: boolean;
    error: string | null;
    roomId?: string;
    playerId?: string;
  }