// src/components/roulette/types/index.ts

export type GamePhase = "BETTING" | "SPINNING" | "RESULTS" | "READY"

export type ChipValue = 0.1 | 1 | 5 | 10 | 20

export type BetType =
  | "straight" // Single number - pays 35:1
  | "split" // 2 numbers - pays 17:1
  | "street" // 3 numbers in a row - pays 11:1
  | "corner" // 4 numbers - pays 8:1
  | "sixLine" // 6 numbers (2 streets) - pays 5:1
  | "dozen1" // 1st dozen (1–12) - pays 2:1
  | "dozen2" // 2nd dozen (13–24) - pays 2:1
  | "dozen3" // 3rd dozen (25–36) - pays 2:1
  | "column1" // 1st column - pays 2:1
  | "column2" // 2nd column - pays 2:1
  | "column3" // 3rd column - pays 2:1
  | "red" // Red numbers - pays 1:1
  | "black" // Black numbers - pays 1:1
  | "odd" // Odd numbers - pays 1:1
  | "even" // Even numbers - pays 1:1
  | "low" // 1–18 - pays 1:1
  | "high" // 19–36 - pays 1:1

export type BetPosition = number | string

export interface Bet {
  id: string
  position: BetPosition
  amount: number
  type: BetType
  numbers: number[]
}

export interface GameState {
  phase: GamePhase
  playerCoins: number
  selectedChip: ChipValue | null
  activeBets: Bet[]
  lastBets: Bet[]
  winningNumber: number | null
  totalBet: number
  lastWin: number
  spinHistory: number[]
}

export interface PayoutConfig {
  [key: string]: number

  // Inside
  straight: number
  split: number
  street: number
  corner: number
  sixLine: number

  // Dozens
  dozen1: number
  dozen2: number
  dozen3: number

  // Columns
  column1: number
  column2: number
  column3: number

  // Outside
  red: number
  black: number
  odd: number
  even: number
  low: number
  high: number
}
