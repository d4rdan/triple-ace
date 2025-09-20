// client/components/games/poker/PokerCard.tsx
import React from 'react';
import { Card } from '../../../types';

interface PokerCardProps {
  card: Card;
  faceDown?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const PokerCard: React.FC<PokerCardProps> = ({ 
  card, 
  faceDown = false, 
  size = 'medium',
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-8 h-12 text-xs',
    medium: 'w-12 h-16 text-sm',
    large: 'w-16 h-24 text-base'
  };

  const getCardSymbol = (suit: string): string => {
    const symbols = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
    return symbols[suit as keyof typeof symbols] || suit;
  };

  const getCardColor = (suit: string): string => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-black';
  };

  if (faceDown) {
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-900 to-blue-700 
                      border-2 border-blue-800 rounded-lg flex items-center justify-center
                      shadow-lg ${className}`}>
        <div className="text-blue-300 text-xl">🂠</div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} bg-white border-2 border-gray-300 rounded-lg 
                    flex flex-col justify-between p-1 shadow-lg ${className}`}>
      <div className="flex items-start justify-between">
        <div className={`font-bold ${getCardColor(card.suit)}`}>
          {card.rank}
        </div>
        <div className={`${getCardColor(card.suit)} text-lg`}>
          {getCardSymbol(card.suit)}
        </div>
      </div>
      
      <div className={`text-center ${getCardColor(card.suit)} text-2xl`}>
        {getCardSymbol(card.suit)}
      </div>
      
      <div className="flex items-end justify-between rotate-180">
        <div className={`font-bold ${getCardColor(card.suit)}`}>
          {card.rank}
        </div>
        <div className={`${getCardColor(card.suit)} text-lg`}>
          {getCardSymbol(card.suit)}
        </div>
      </div>
    </div>
  );
};

export default PokerCard;