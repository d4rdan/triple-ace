// /client/src/components/roulette/utils/constants.ts
import { ChipValue, BetType } from '../hooks/useRouletteGame';

// Chip values available for betting
export const CHIP_VALUES: ChipValue[] = [0.1, 1, 5, 10, 20];

// Payout ratios for different bet types
export const PAYOUTS: Record<BetType, number> = {
  // Inside bets
  straight: 35,
  split: 17,
  street: 11,
  corner: 8,
  sixLine: 5,

  // Outside bets
  red: 1,
  black: 1,
  odd: 1,
  even: 1,
  low: 1,
  high: 1,

  // Dozens and columns
  dozen1: 2,
  dozen2: 2,
  dozen3: 2,
  column1: 2,
  column2: 2,
  column3: 2,
};

// Red numbers on the roulette wheel
export const RED_NUMBERS = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];

// Black numbers on the roulette wheel
export const BLACK_NUMBERS = [
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
];

// European wheel number sequence (clockwise from 0)
export const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

// Game timing constants
export const SPIN_DURATION = 3000; // 3 seconds
export const RESULTS_DURATION = 4000; // 4 seconds to show results
export const AUTO_CLEAR_DELAY = 4000; // Auto-clear bets after result

// Betting limits
export const MIN_BET = 0.1;
export const MAX_BET = 1000;

// Animation constants
export const WHEEL_SPIN_DURATION = 3000;
export const BALL_SPIN_MULTIPLIER = 1.1; // Ball spins slightly faster than wheel

// Responsive breakpoints
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
} as const;