// src/components/roulette/utils/gameLogic.ts

import { Bet, BetType, BetPosition } from "../types"
import { PAYOUTS, RED_NUMBERS, BLACK_NUMBERS } from "./constants"

// Generate unique bet ID
export const generateBetId = (): string => {
  return `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Generate random winning number (0-36)
export const generateWinningNumber = (): number => {
  return Math.floor(Math.random() * 37)
}

// Check if bet wins
export const isBetWinner = (bet: Bet, winningNumber: number): boolean => {
  return bet.numbers.includes(winningNumber)
}

// Calculate win amount for a bet
export const calculateBetWin = (bet: Bet): number => {
  const payout = PAYOUTS[bet.type]
  return bet.amount + bet.amount * payout
}

// Calculate total wins
export const calculateTotalWins = (
  bets: Bet[],
  winningNumber: number
): number => {
  return bets
    .filter((bet) => isBetWinner(bet, winningNumber))
    .reduce((total, bet) => total + calculateBetWin(bet), 0)
}

// Get numbers for different bet types
export const getNumbersForBet = (
  position: BetPosition,
  type: BetType
): number[] => {
  switch (type) {
    case "straight":
      return [position as number]

    case "split":
      // Split logic will be handled by betting table
      return []

    case "street":
      const streetStart = position as number
      return [streetStart, streetStart + 1, streetStart + 2]

    case "corner":
      // Corner logic will be handled by betting table
      return []

    case "sixLine":
      const sixLineStart = position as number
      return [
        sixLineStart,
        sixLineStart + 1,
        sixLineStart + 2,
        sixLineStart + 3,
        sixLineStart + 4,
        sixLineStart + 5,
      ]

    case "dozen1":
      return Array.from({ length: 12 }, (_, i) => i + 1)
    case "dozen2":
      return Array.from({ length: 12 }, (_, i) => i + 13)
    case "dozen3":
      return Array.from({ length: 12 }, (_, i) => i + 25)

    case "column1":
      return Array.from({ length: 12 }, (_, i) => 1 + i * 3)
    case "column2":
      return Array.from({ length: 12 }, (_, i) => 2 + i * 3)
    case "column3":
      return Array.from({ length: 12 }, (_, i) => 3 + i * 3)

      const col = position === "1st" ? 1 : position === "2nd" ? 2 : 3
      return Array.from({ length: 12 }, (_, i) => col + i * 3)

    case "red":
      return RED_NUMBERS

    case "black":
      return BLACK_NUMBERS

    case "odd":
      return Array.from({ length: 18 }, (_, i) => i * 2 + 1)

    case "even":
      return Array.from({ length: 18 }, (_, i) => (i + 1) * 2)

    case "low":
      return Array.from({ length: 18 }, (_, i) => i + 1)

    case "high":
      return Array.from({ length: 18 }, (_, i) => i + 19)

    default:
      return []
  }
}

// Validate if bet can be placed
export const canPlaceBet = (
  amount: number,
  playerCoins: number,
  currentTotalBet: number
): boolean => {
  return amount > 0 && currentTotalBet + amount <= playerCoins
}
