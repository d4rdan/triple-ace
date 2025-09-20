// server/src/utils/gameLogic.js
const ROULETTE_NUMBERS = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

function generateWinningNumber() {
  return ROULETTE_NUMBERS[Math.floor(Math.random() * ROULETTE_NUMBERS.length)];
}

function calculateRoulettePayout(bet, winningNumber) {
  const { type, numbers, amount } = bet;
  
  if (!numbers.includes(winningNumber)) return 0;
  
  const payouts = {
    straight: 35,
    split: 17,
    street: 11,
    corner: 8,
    sixLine: 5,
    dozen: 2,
    column: 2,
    red: 1,
    black: 1,
    odd: 1,
    even: 1,
    low: 1,
    high: 1
  };
  
  return amount + (amount * payouts[type]);
}

function evaluatePokerHand(cards) {
  // Simplified poker hand evaluation
  const ranks = cards.map(c => c.rank);
  const suits = cards.map(c => c.suit);
  
  const rankCounts = {};
  ranks.forEach(rank => {
    rankCounts[rank] = (rankCounts[rank] || 0) + 1;
  });
  
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const isFlush = suits.every(suit => suit === suits[0]);
  
  if (counts[0] === 4) return { rank: 'four-of-a-kind', value: 8 };
  if (counts[0] === 3 && counts[1] === 2) return { rank: 'full-house', value: 7 };
  if (isFlush) return { rank: 'flush', value: 6 };
  if (counts[0] === 3) return { rank: 'three-of-a-kind', value: 4 };
  if (counts[0] === 2 && counts[1] === 2) return { rank: 'two-pair', value: 3 };
  if (counts[0] === 2) return { rank: 'pair', value: 2 };
  return { rank: 'high-card', value: 1 };
}

module.exports = {
  generateWinningNumber,
  calculateRoulettePayout,
  evaluatePokerHand,
  ROULETTE_NUMBERS,
  RED_NUMBERS
};