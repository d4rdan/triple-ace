// /server/src/game-logic/HandEvaluator.ts
import { Card } from '../rooms/PokerState';

export interface HandRanking {
  rank: number;
  name: string;
  tiebreaker: number;
  description: string;
  cards: Card[];
}

export interface EvaluationResult {
  bestHand: HandRanking;
  allPossibleHands: HandRanking[];
}

export class HandEvaluator {
  private readonly HAND_RANKS = {
    HIGH_CARD: 1,
    PAIR: 2,
    TWO_PAIR: 3,
    THREE_OF_A_KIND: 4,
    STRAIGHT: 5,
    FLUSH: 6,
    FULL_HOUSE: 7,
    FOUR_OF_A_KIND: 8,
    STRAIGHT_FLUSH: 9,
    ROYAL_FLUSH: 10
  };

  private readonly HAND_NAMES = {
    [this.HAND_RANKS.HIGH_CARD]: 'High Card',
    [this.HAND_RANKS.PAIR]: 'Pair',
    [this.HAND_RANKS.TWO_PAIR]: 'Two Pair',
    [this.HAND_RANKS.THREE_OF_A_KIND]: 'Three of a Kind',
    [this.HAND_RANKS.STRAIGHT]: 'Straight',
    [this.HAND_RANKS.FLUSH]: 'Flush',
    [this.HAND_RANKS.FULL_HOUSE]: 'Full House',
    [this.HAND_RANKS.FOUR_OF_A_KIND]: 'Four of a Kind',
    [this.HAND_RANKS.STRAIGHT_FLUSH]: 'Straight Flush',
    [this.HAND_RANKS.ROYAL_FLUSH]: 'Royal Flush'
  };

  /**
   * Evaluate the best 5-card hand from up to 7 cards (2 hole + 5 community)
   */
  evaluateBestHand(playerCards: Card[], communityCards: Card[]): HandRanking {
    const allCards = [...playerCards, ...communityCards];
    
    if (allCards.length < 5) {
      throw new Error('Need at least 5 cards to evaluate a hand');
    }

    // Generate all possible 5-card combinations
    const combinations = this.getCombinations(allCards, 5);
    let bestHand: HandRanking | null = null;

    for (const combo of combinations) {
      const handRanking = this.evaluateHand(combo);
      
      if (!bestHand || this.compareHands(handRanking, bestHand) > 0) {
        bestHand = handRanking;
      }
    }

    return bestHand!;
  }

  /**
   * Evaluate a specific 5-card hand
   */
  evaluateHand(cards: Card[]): HandRanking {
    if (cards.length !== 5) {
      throw new Error('Hand must contain exactly 5 cards');
    }

    const sortedCards = [...cards].sort((a, b) => b.value - a.value);
    const isFlush = this.isFlush(cards);
    const straightResult = this.getStraightInfo(cards);
    const rankCounts = this.getRankCounts(cards);
    
    // Convert rank counts to sorted array
    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    const ranks = Object.keys(rankCounts)
      .map(r => parseInt(r))
      .sort((a, b) => b - a);

    // Check for each hand type (highest to lowest)
    
    // Royal Flush: A-K-Q-J-10 all same suit
    if (isFlush && straightResult.isWheel === false && sortedCards[0].value === 14) {
      const isRoyalStraight = sortedCards.every((card, index) => 
        card.value === [14, 13, 12, 11, 10][index]
      );
      
      if (isRoyalStraight) {
        return {
          rank: this.HAND_RANKS.ROYAL_FLUSH,
          name: this.HAND_NAMES[this.HAND_RANKS.ROYAL_FLUSH],
          tiebreaker: 0, // All royal flushes are equal
          description: `Royal Flush (${cards[0].suit})`,
          cards: sortedCards
        };
      }
    }

    // Straight Flush: 5 consecutive cards, all same suit
    if (isFlush && straightResult.isStraight) {
      return {
        rank: this.HAND_RANKS.STRAIGHT_FLUSH,
        name: this.HAND_NAMES[this.HAND_RANKS.STRAIGHT_FLUSH],
        tiebreaker: straightResult.highCard,
        description: `Straight Flush, ${this.getCardName(straightResult.highCard)} high`,
        cards: sortedCards
      };
    }

    // Four of a Kind: 4 cards of same rank
    if (counts[0] === 4) {
      const fourKindRank = ranks.find(rank => rankCounts[rank] === 4)!;
      const kicker = ranks.find(rank => rankCounts[rank] === 1)!;
      
      return {
        rank: this.HAND_RANKS.FOUR_OF_A_KIND,
        name: this.HAND_NAMES[this.HAND_RANKS.FOUR_OF_A_KIND],
        tiebreaker: fourKindRank * 100 + kicker,
        description: `Four ${this.getCardName(fourKindRank)}s`,
        cards: sortedCards
      };
    }

    // Full House: 3 of a kind + pair
    if (counts[0] === 3 && counts[1] === 2) {
      const threeKindRank = ranks.find(rank => rankCounts[rank] === 3)!;
      const pairRank = ranks.find(rank => rankCounts[rank] === 2)!;
      
      return {
        rank: this.HAND_RANKS.FULL_HOUSE,
        name: this.HAND_NAMES[this.HAND_RANKS.FULL_HOUSE],
        tiebreaker: threeKindRank * 100 + pairRank,
        description: `${this.getCardName(threeKindRank)}s full of ${this.getCardName(pairRank)}s`,
        cards: sortedCards
      };
    }

    // Flush: 5 cards of same suit
    if (isFlush) {
      const tiebreaker = this.calculateHighCardTiebreaker(sortedCards);
      return {
        rank: this.HAND_RANKS.FLUSH,
        name: this.HAND_NAMES[this.HAND_RANKS.FLUSH],
        tiebreaker,
        description: `${this.getCardName(sortedCards[0].value)} high flush`,
        cards: sortedCards
      };
    }

    // Straight: 5 consecutive cards
    if (straightResult.isStraight) {
      return {
        rank: this.HAND_RANKS.STRAIGHT,
        name: this.HAND_NAMES[this.HAND_RANKS.STRAIGHT],
        tiebreaker: straightResult.highCard,
        description: `Straight, ${this.getCardName(straightResult.highCard)} high`,
        cards: sortedCards
      };
    }

    // Three of a Kind: 3 cards of same rank
    if (counts[0] === 3) {
      const threeKindRank = ranks.find(rank => rankCounts[rank] === 3)!;
      const kickers = ranks.filter(rank => rankCounts[rank] === 1).sort((a, b) => b - a);
      
      return {
        rank: this.HAND_RANKS.THREE_OF_A_KIND,
        name: this.HAND_NAMES[this.HAND_RANKS.THREE_OF_A_KIND],
        tiebreaker: threeKindRank * 10000 + kickers[0] * 100 + kickers[1],
        description: `Three ${this.getCardName(threeKindRank)}s`,
        cards: sortedCards
      };
    }

    // Two Pair: 2 pairs of different ranks
    if (counts[0] === 2 && counts[1] === 2) {
      const pairs = ranks.filter(rank => rankCounts[rank] === 2).sort((a, b) => b - a);
      const kicker = ranks.find(rank => rankCounts[rank] === 1)!;
      
      return {
        rank: this.HAND_RANKS.TWO_PAIR,
        name: this.HAND_NAMES[this.HAND_RANKS.TWO_PAIR],
        tiebreaker: pairs[0] * 10000 + pairs[1] * 100 + kicker,
        description: `${this.getCardName(pairs[0])}s and ${this.getCardName(pairs[1])}s`,
        cards: sortedCards
      };
    }

    // One Pair: 2 cards of same rank
    if (counts[0] === 2) {
      const pairRank = ranks.find(rank => rankCounts[rank] === 2)!;
      const kickers = ranks.filter(rank => rankCounts[rank] === 1).sort((a, b) => b - a);
      
      return {
        rank: this.HAND_RANKS.PAIR,
        name: this.HAND_NAMES[this.HAND_RANKS.PAIR],
        tiebreaker: pairRank * 1000000 + kickers[0] * 10000 + kickers[1] * 100 + kickers[2],
        description: `Pair of ${this.getCardName(pairRank)}s`,
        cards: sortedCards
      };
    }

    // High Card: No other combination
    const tiebreaker = this.calculateHighCardTiebreaker(sortedCards);
    return {
      rank: this.HAND_RANKS.HIGH_CARD,
      name: this.HAND_NAMES[this.HAND_RANKS.HIGH_CARD],
      tiebreaker,
      description: `${this.getCardName(sortedCards[0].value)} high`,
      cards: sortedCards
    };
  }

  /**
   * Compare two hands and return 1 if hand1 wins, -1 if hand2 wins, 0 if tie
   */
  compareHands(hand1: HandRanking, hand2: HandRanking): number {
    if (hand1.rank > hand2.rank) return 1;
    if (hand1.rank < hand2.rank) return -1;
    
    // Same rank, compare tiebreakers
    if (hand1.tiebreaker > hand2.tiebreaker) return 1;
    if (hand1.tiebreaker < hand2.tiebreaker) return -1;
    
    return 0; // Exact tie
  }

  /**
   * Check if all cards are the same suit
   */
  private isFlush(cards: Card[]): boolean {
    const suit = cards[0].suit;
    return cards.every(card => card.suit === suit);
  }

  /**
   * Check for straight and return info about it
   */
  private getStraightInfo(cards: Card[]): { isStraight: boolean; highCard: number; isWheel: boolean } {
    const values = cards.map(card => card.value).sort((a, b) => a - b);
    
    // Check for A-2-3-4-5 straight (wheel/low straight)
    if (values.join(',') === '2,3,4,5,14') {
      return { isStraight: true, highCard: 5, isWheel: true };
    }
    
    // Check for regular straight
    for (let i = 1; i < values.length; i++) {
      if (values[i] !== values[i - 1] + 1) {
        return { isStraight: false, highCard: 0, isWheel: false };
      }
    }
    
    return { isStraight: true, highCard: values[values.length - 1], isWheel: false };
  }

  /**
   * Count occurrences of each rank
   */
  private getRankCounts(cards: Card[]): { [rank: number]: number } {
    const counts: { [rank: number]: number } = {};
    for (const card of cards) {
      counts[card.value] = (counts[card.value] || 0) + 1;
    }
    return counts;
  }

  /**
   * Calculate tiebreaker for high card situations
   */
  private calculateHighCardTiebreaker(sortedCards: Card[]): number {
    return sortedCards.reduce((acc, card, index) => 
      acc + card.value * Math.pow(100, 4 - index), 0
    );
  }

  /**
   * Generate all possible combinations of cards
   */
  private getCombinations(cards: Card[], size: number): Card[][] {
    if (size === 1) return cards.map(card => [card]);
    if (size === cards.length) return [cards];

    const combinations: Card[][] = [];
    for (let i = 0; i <= cards.length - size; i++) {
      const head = cards[i];
      const tailCombos = this.getCombinations(cards.slice(i + 1), size - 1);
      for (const combo of tailCombos) {
        combinations.push([head, ...combo]);
      }
    }
    return combinations;
  }

  /**
   * Get readable name for card value
   */
  private getCardName(value: number): string {
    switch (value) {
      case 14: return 'Ace';
      case 13: return 'King';
      case 12: return 'Queen';
      case 11: return 'Jack';
      default: return value.toString();
    }
  }

  /**
   * Get all possible 5-card hands from given cards (for analysis)
   */
  getAllPossibleHands(playerCards: Card[], communityCards: Card[]): EvaluationResult {
    const allCards = [...playerCards, ...communityCards];
    const combinations = this.getCombinations(allCards, 5);
    
    const allHands = combinations.map(combo => this.evaluateHand(combo));
    const bestHand = allHands.reduce((best, current) => 
      this.compareHands(current, best) > 0 ? current : best
    );

    return {
      bestHand,
      allPossibleHands: allHands.sort((a, b) => this.compareHands(b, a))
    };
  }

  /**
   * Utility method to create a hand strength score for easy comparison
   */
  getHandStrength(hand: HandRanking): number {
    return hand.rank * 1000000 + hand.tiebreaker;
  }
}