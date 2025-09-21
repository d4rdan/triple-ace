// client/src/components/poker/components/Card.tsx

import React from 'react';
import { Card as CardType } from '../types';

interface CardProps {
  card?: CardType;
  faceDown?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Card: React.FC<CardProps> = ({ 
  card, 
  faceDown = false, 
  size = 'medium',
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-10 h-14 text-xs';
      case 'large':
        return 'w-16 h-24 text-lg';
      default:
        return 'w-12 h-18 text-sm';
    }
  };

  const getCardColor = (suit: string) => {
    return suit === '♥' || suit === '♦' ? 'text-red-600' : 'text-gray-900';
  };

  if (faceDown || !card) {
    return (
      <div className={`
        ${getSizeClasses()}
        bg-gradient-to-br from-blue-600 to-blue-800 
        border-2 border-blue-900 
        rounded-lg shadow-lg 
        flex items-center justify-center
        ${className}
      `}>
        <div className="text-blue-200 text-xl">🂠</div>
      </div>
    );
  }

  return (
    <div className={`
      ${getSizeClasses()}
      bg-white 
      border-2 border-gray-300 
      rounded-lg shadow-lg 
      flex flex-col justify-between
      p-1 relative overflow-hidden
      ${className}
    `}>
      {/* Top left corner */}
      <div className={`self-start ${getCardColor(card.suit)} font-bold leading-none`}>
        <div className="text-center">
          <div className="text-xs">{card.rank}</div>
          <div className="text-xs -mt-0.5">{card.suit}</div>
        </div>
      </div>
      
      {/* Center suit - properly centered */}
      <div className={`absolute inset-0 flex items-center justify-center ${getCardColor(card.suit)}`}>
        <div className="text-xl font-bold">
          {card.suit}
        </div>
      </div>
      
      {/* Bottom right corner (rotated) */}
      <div className={`self-end ${getCardColor(card.suit)} font-bold transform rotate-180 leading-none`}>
        <div className="text-center">
          <div className="text-xs">{card.rank}</div>
          <div className="text-xs -mt-0.5">{card.suit}</div>
        </div>
      </div>
    </div>
  );
};