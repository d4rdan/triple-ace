// src/components/roulette/utils/constants.ts - Updated for Backend Integration

import { ChipValue, PayoutConfig } from "../types"

// Chip values
export const CHIP_VALUES: ChipValue[] = [0.1, 1, 5, 10, 20]

// Payouts
export const PAYOUTS: PayoutConfig = {
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

  // Now correctly match all specific types
  dozen1: 2,
  dozen2: 2,
  dozen3: 2,
  column1: 2,
  column2: 2,
  column3: 2,
}

// Red and black numbers
export const RED_NUMBERS = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]
export const BLACK_NUMBERS = [
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
]

// European wheel sequence
export const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
]

// Game settings - REMOVED INITIAL_COINS since balance comes from backend
export const SPIN_DURATION = 3000
export const RESULTS_DURATION = 3000

// Breakpoints
export const BREAKPOINTS = {
  mobile: 1024, // Everything below 1024 is mobile/tablet (no wheel)
  desktop: 1024, // Desktop starts at 1024+
} as const