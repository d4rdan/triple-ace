// /client/src/components/roulette/types/index.ts
export type ChipValue = 0.1 | 1 | 5 | 10 | 20;

export type BetType = 
  | 'straight'   // Single number - pays 35:1
  | 'split'      // 2 adjacent numbers - pays 17:1
  | 'street'     // 3 numbers in a row - pays 11:1
  | 'corner'     // 4 numbers - pays 8:1
  | 'sixLine'    // 6 numbers (2 streets) - pays 5:1
  | 'dozen1'     // 1st dozen (1-12) - pays 2:1
  | 'dozen2'     // 2nd dozen (13-24) - pays 2:1
  | 'dozen3'     // 3rd dozen (25-36) - pays 2:1
  | 'column1'    // 1st column - pays 2:1
  | 'column2'    // 2nd column - pays 2:1
  | 'column3'    // 3rd column - pays 2:1
  | 'red'        // Red numbers - pays 1:1
  | 'black'      // Black numbers - pays 1:1
  | 'odd'        // Odd numbers - pays 1:1
  | 'even'       // Even numbers - pays 1:1
  | 'low'        // 1-18 - pays 1:1
  | 'high';      // 19-36 - pays 1:1

export type BetPosition = number | string;

export interface Bet {
  id: string;
  position: BetPosition;
  amount: number;
  type: BetType;
  numbers: number[];
  timestamp: number;
}

export interface GameState {
  phase: 'betting' | 'spinning' | 'results' | 'ready';
  selectedChip: ChipValue | null;
  activeBets: Bet[];
  lastBets: Bet[];
  winningNumber: number | null;
  totalBet: number;
  lastWin: number;
  spinHistory: number[];
  isSpinning: boolean;
  showResult: boolean;
}

export interface RouletteSettings {
  soundEnabled: boolean;
  autoPlay: boolean;
  fastSpin: boolean;
  showStatistics: boolean;
  theme: 'classic' | 'modern' | 'neon';
}

export interface SpinResult {
  number: number;
  color: 'red' | 'black' | 'green';
  winningBets: Bet[];
  totalWin: number;
  profit: number;
}

export interface PayoutConfig {
  [key: string]: number;
  
  // Inside bets
  straight: number;
  split: number;
  street: number;
  corner: number;
  sixLine: number;
  
  // Dozens
  dozen1: number;
  dozen2: number;
  dozen3: number;
  
  // Columns
  column1: number;
  column2: number;
  column3: number;
  
  // Outside bets
  red: number;
  black: number;
  odd: number;
  even: number;
  low: number;
  high: number;
}

export interface GameStatistics {
  totalSpins: number;
  totalBets: number;
  totalWins: number;
  biggestWin: number;
  favoriteNumbers: number[];
  redPercentage: number;
  blackPercentage: number;
  zeroPercentage: number;
  profitLoss: number;
}