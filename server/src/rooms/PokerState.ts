// /server/src/rooms/PokerState.ts
import { Schema, type, MapSchema, ArraySchema } from '@colyseus/schema';

export class Card extends Schema {
  @type('string') id: string = '';
  @type('string') suit: '♠' | '♥' | '♦' | '♣' = '♠';
  @type('string') rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' = '2';
  @type('number') value: number = 2;

  constructor() {
    super();
  }
}

export class PokerPlayer extends Schema {
  @type('string') id: string = '';
  @type('string') name: string = '';
  @type('number') chips: number = 1000;
  @type([Card]) cards = new ArraySchema<Card>();
  @type('number') currentBet: number = 0;
  @type('boolean') folded: boolean = false;
  @type('boolean') allIn: boolean = false;
  @type('boolean') connected: boolean = true;
  @type('number') position: number = 0;
  @type('boolean') isDealer: boolean = false;
  @type('boolean') hasActed: boolean = false;
  @type('boolean') showCards: boolean = false;

  constructor() {
    super();
  }
}

export class Winner extends Schema {
  @type('string') playerId: string = '';
  @type('string') playerName: string = '';
  @type('string') hand: string = '';
  @type('number') winAmount: number = 0;

  constructor() {
    super();
  }
}

export class PokerState extends Schema {
  @type('string') gamePhase: 'waiting' | 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown' | 'finished' = 'waiting';
  @type({ map: PokerPlayer }) players = new MapSchema<PokerPlayer>();
  @type([Card]) communityCards = new ArraySchema<Card>();
  @type('number') pot: number = 0;
  @type('number') currentBet: number = 0;
  @type('string') currentTurn: string = '';
  @type('number') dealerPosition: number = 0;
  @type('number') smallBlind: number = 10;
  @type('number') bigBlind: number = 20;
  @type('number') round: number = 1;
  @type(Winner) winner?: Winner;

  constructor() {
    super();
  }
}'J' | 'Q' | 'K' | 'A' = '2';
  @type('number') value: number = 2;
}

export class PokerPlayer extends Schema {
  @type('string') id: string = '';
  @type('string') name: string = '';
  @type('number') chips: number = 1000;
  @type([Card]) cards = new ArraySchema<Card>();
  @type('number') currentBet: number = 0;
  @type('boolean') folded: boolean = false;
  @type('boolean') allIn: boolean = false;
  @type('boolean') connected: boolean = true;
  @type('number') position: number = 0;
  @type('boolean') isDealer: boolean = false;
  @type('boolean') hasActed: boolean = false;
  @type('boolean') showCards: boolean = false;
}

export class Winner extends Schema {
  @type('string') playerId: string = '';
  @type('string') playerName: string = '';
  @type('string') hand: string = '';
  @type('number') winAmount: number = 0;
}

export class PokerState extends Schema {
  @type('string') gamePhase: 'waiting' | 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown' | 'finished' = 'waiting';
  @type({ map: PokerPlayer }) players = new MapSchema<PokerPlayer>();
  @type([Card]) communityCards = new ArraySchema<Card>();
  @type('number') pot: number = 0;
  @type('number') currentBet: number = 0;
  @type('string') currentTurn: string = '';
  @type('number') dealerPosition: number = 0;
  @type('number') smallBlind: number = 10;
  @type('number') bigBlind: number = 20;
  @type('number') round: number = 1;
  @type(Winner) winner?: Winner;
}