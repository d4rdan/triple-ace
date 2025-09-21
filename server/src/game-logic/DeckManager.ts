// /server/src/game-logic/DeckManager.ts
import { Card } from '../rooms/PokerState';

export class DeckManager {
  private readonly suits: Array<'♠' | '♥' | '♦' | '♣'> = ['♠', '♥', '♦', '♣'];
  private readonly ranks: Array<'2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'> = 
    ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  createShuffledDeck(): Card[] {
    const deck: Card[] = [];
    
    // Create all 52 cards
    for (const suit of this.suits) {
      for (const rank of this.ranks) {
        const card = new Card();
        card.id = `${suit}${rank}`;
        card.suit = suit;
        card.rank = rank;
        card.value = this.getRankValue(rank);
        deck.push(card);
      }
    }
    
    // Shuffle the deck using Fisher-Yates algorithm
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
  }

  private getRankValue(rank: string): number {
    switch (rank) {
      case '2': return 2;
      case '3': return 3;
      case '4': return 4;
      case '5': return 5;
      case '6': return 6;
      case '7': return 7;
      case '8': return 8;
      case '9': return 9;
      case '10': return 10;
      case 'J': return 11;
      case 'Q': return 12;
      case 'K': return 13;
      case 'A': return 14;
      default: return 2;
    }
  }

  // Utility method to create a specific card (useful for testing)
  createCard(suit: '♠' | '♥' | '♦' | '♣', rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'): Card {
    const card = new Card();
    card.id = `${suit}${rank}`;
    card.suit = suit;
    card.rank = rank;
    card.value = this.getRankValue(rank);
    return card;
  }
}