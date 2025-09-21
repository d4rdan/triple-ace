// client/src/components/poker/types/index.ts

export interface Card {
  suit: string;
  rank: string;
  value: number;
}

export interface Player {
  id: string;
  name: string;
  chips: number;
  currentBet: number;
  isActive: boolean;
  isFolded: boolean;
  isAllIn: boolean;
  position: number;
  hand: Card[];
  lastAction: string;
}

export interface PokerGameState {
  players: { [key: string]: Player };
  communityCards: Card[];
  pot: number;
  currentBet: number;
  currentPlayer: string;
  phase: 'waiting' | 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown';
  dealerPosition: number;
  smallBlind: number;
  bigBlind: number;
  message: string;
  gameStarted: boolean;
  roundNumber: number;
}

export interface ConnectionState {
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  roomId?: string;
  playerId?: string;
}

export type PlayerAction = {
  type: 'fold' | 'check' | 'call' | 'raise';
  amount?: number;
};