// /server/src/game-logic/PokerEngine.ts
import { Card } from '../rooms/PokerState';
import { HandEvaluator, HandRanking } from './HandEvaluator';

export interface HandResult {
  strength: number;
  description: string;
  cards: Card[];
}

export class PokerEngine {
  private handEvaluator: HandEvaluator;

  constructor() {
    this.handEvaluator = new HandEvaluator();
  }

  /**
   * Evaluate the best hand from player cards and community cards
   */
  evaluateHand(playerCards: Card[], communityCards: Card[]): HandResult {
    const bestHand = this.handEvaluator.evaluateBestHand(playerCards, communityCards);
    
    return {
      strength: this.handEvaluator.getHandStrength(bestHand),
      description: bestHand.description,
      cards: bestHand.cards
    };
  }

  /**
   * Compare two players' hands and return the winner
   * Returns 1 if player1 wins, -1 if player2 wins, 0 if tie
   */
  comparePlayerHands(
    player1Cards: Card[], 
    player2Cards: Card[], 
    communityCards: Card[]
  ): number {
    const hand1 = this.handEvaluator.evaluateBestHand(player1Cards, communityCards);
    const hand2 = this.handEvaluator.evaluateBestHand(player2Cards, communityCards);
    
    return this.handEvaluator.compareHands(hand1, hand2);
  }

  /**
   * Find the winner(s) among multiple players
   */
  findWinners(
    players: Array<{ id: string; name: string; cards: Card[] }>,
    communityCards: Card[]
  ): Array<{ playerId: string; playerName: string; hand: HandRanking; strength: number }> {
    
    // Evaluate all hands
    const evaluatedPlayers = players.map(player => {
      const bestHand = this.handEvaluator.evaluateBestHand(player.cards, communityCards);
      return {
        playerId: player.id,
        playerName: player.name,
        hand: bestHand,
        strength: this.handEvaluator.getHandStrength(bestHand)
      };
    });

    // Find the highest strength
    const maxStrength = Math.max(...evaluatedPlayers.map(p => p.strength));
    
    // Return all players with the highest strength (handles ties)
    return evaluatedPlayers.filter(p => p.strength === maxStrength);
  }

  /**
   * Calculate hand equity (percentage chance of winning) - simplified version
   * In a real implementation, this would use Monte Carlo simulation
   */
  calculateHandEquity(
    playerCards: Card[], 
    communityCards: Card[], 
    opponentCount: number = 1
  ): number {
    // This is a simplified equity calculation
    // A full implementation would simulate thousands of possible outcomes
    
    const currentHand = this.handEvaluator.evaluateBestHand(
      playerCards, 
      communityCards.length >= 5 ? communityCards : [...communityCards, ...this.createDummyCards(5 - communityCards.length)]
    );
    
    // Basic equity based on hand strength (this is very simplified)
    const handStrength = this.handEvaluator.getHandStrength(currentHand);
    const maxPossibleStrength = 10 * 1000000; // Royal flush strength
    
    const baseEquity = handStrength / maxPossibleStrength;
    
    // Adjust for number of opponents (more opponents = lower equity)
    const adjustedEquity = baseEquity / (1 + opponentCount * 0.3);
    
    return Math.min(Math.max(adjustedEquity, 0.01), 0.99); // Keep between 1% and 99%
  }

  /**
   * Get readable hand analysis for UI display
   */
  analyzeHand(playerCards: Card[], communityCards: Card[]): {
    currentBest: HandRanking;
    possibleDraws: string[];
    handType: string;
    strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  } {
    const result = this.handEvaluator.getAllPossibleHands(playerCards, communityCards);
    const bestHand = result.bestHand;
    
    // Determine hand strength category
    let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
    if (bestHand.rank >= 8) strength = 'very-strong'; // Four of a kind or better
    else if (bestHand.rank >= 6) strength = 'strong'; // Flush or better
    else if (bestHand.rank >= 3) strength = 'medium'; // Two pair or better
    else strength = 'weak'; // Pair or high card

    // Analyze possible draws (simplified)
    const possibleDraws: string[] = [];
    if (communityCards.length < 5) {
      if (bestHand.rank === 1) possibleDraws.push('Any pair');
      if (this.hasFlushDraw(playerCards, communityCards)) possibleDraws.push('Flush');
      if (this.hasStraightDraw(playerCards, communityCards)) possibleDraws.push('Straight');
    }

    return {
      currentBest: bestHand,
      possibleDraws,
      handType: bestHand.name,
      strength
    };
  }

  /**
   * Check if player has a flush draw
   */
  private hasFlushDraw(playerCards: Card[], communityCards: Card[]): boolean {
    const allCards = [...playerCards, ...communityCards];
    const suitCounts: { [suit: string]: number } = {};
    
    allCards.forEach(card => {
      suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
    });
    
    return Object.values(suitCounts).some(count => count === 4);
  }

  /**
   * Check if player has a straight draw
   */
  private hasStraightDraw(playerCards: Card[], communityCards: Card[]): boolean {
    const allCards = [...playerCards, ...communityCards];
    const values = [...new Set(allCards.map(card => card.value))].sort((a, b) => a - b);
    
    // Check for open-ended straight draws or gutshots
    for (let i = 0; i <= values.length - 4; i++) {
      const consecutive = values.slice(i, i + 4);
      const gaps = consecutive.map((val, idx) => idx === 0 ? 0 : val - consecutive[idx - 1]);
      
      // If we have 4 cards with at most 1 gap, it's a straight draw
      if (gaps.slice(1).every(gap => gap <= 2) && consecutive[3] - consecutive[0] <= 4) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Create dummy cards for equity calculation
   */
  private createDummyCards(count: number): Card[] {
    const dummyCards: Card[] = [];
    const suits: Array<'♠' | '♥' | '♦' | '♣'> = ['♠', '♥', '♦', '♣'];
    
    for (let i = 0; i < count; i++) {
      const dummyCard = new Card();
      dummyCard.id = `dummy-${i}`;
      dummyCard.suit = suits[i % 4];
      dummyCard.rank = '2';
      dummyCard.value = 2;
      dummyCards.push(dummyCard);
    }
    
    return dummyCards;
  }
}4 - index), 0);
    return {
      rank: this.HAND_RANKINGS.HIGH_CARD,
      tiebreaker,
      description: 'High Card',
      cards: sortedCards
    };
  }

  private isFlush(cards: Card[]): boolean {
    const suit = cards[0].suit;
    return cards.every(card => card.suit === suit);
  }

  private isStraight(cards: Card[]): { isStraight: boolean; highCard: number } {
    const values = cards.map(card => card.value).sort((a, b) => a - b);
    
    // Check for A-2-3-4-5 straight (wheel)
    if (values.join(',') === '2,3,4,5,14') {
      return { isStraight: true, highCard: 5 };
    }
    
    // Check for regular straight
    for (let i = 1; i < values.length; i++) {
      if (values[i] !== values[i - 1] + 1) {
        return { isStraight: false, highCard: 0 };
      }
    }
    
    return { isStraight: true, highCard: values[values.length - 1] };
  }

  private getRankCounts(cards: Card[]): { [rank: number]: number } {
    const counts: { [rank: number]: number } = {};
    for (const card of cards) {
      counts[card.value] = (counts[card.value] || 0) + 1;
    }
    return counts;
  }
}