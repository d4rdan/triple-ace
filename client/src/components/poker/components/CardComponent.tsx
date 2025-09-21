// /client/src/components/poker/components/CardComponent.tsx
import React from 'react';
import { Card } from '../context/PokerGameContext';

interface CardComponentProps {
  card?: Card;
  faceDown?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const CardComponent: React.FC<CardComponentProps> = ({
  card,
  faceDown = false,
  size = 'medium',
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-10 h-14';
      case 'large':
        return 'w-16 h-24 md:w-20 md:h-28';
      case 'medium':
      default:
        return 'w-12 h-16';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-xs';
      case 'large':
        return 'text-lg md:text-xl';
      case 'medium':
      default:
        return 'text-sm';
    }
  };

  const getSuitSize = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-2xl md:text-3xl';
      case 'medium':
      default:
        return 'text-lg';
    }
  };

  const getCardColor = (suit?: string): string => {
    if (!suit) return 'text-black';
    return suit === '♥' || suit === '♦' ? 'text-red-600' : 'text-black';
  };

  if (faceDown) {
    return (
      <div className={`${getSizeClasses()} ${className} bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border-2 border-blue-400 flex items-center justify-center shadow-lg`}>
        <div className="text-white text-xl opacity-80">🂠</div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className={`${getSizeClasses()} ${className} border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center opacity-50`}>
        <div className="text-gray-400 text-lg">?</div>
      </div>
    );
  }

  return (
    <div className={`${getSizeClasses()} ${className} bg-white rounded-lg border-2 border-gray-300 shadow-lg flex flex-col relative overflow-hidden`}>
      {/* Card Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50"></div>
      
      {/* Top Left Corner */}
      <div className={`absolute top-1 left-1 ${getCardColor(card.suit)} ${getTextSize()} font-bold leading-none`}>
        <div>{card.rank}</div>
        <div className={`${getSuitSize()} leading-none`}>{card.suit}</div>
      </div>
      
      {/* Center Suit */}
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${getCardColor(card.suit)}`}>
        <div className={`${getSuitSize()} opacity-20`}>{card.suit}</div>
      </div>
      
      {/* Bottom Right Corner (Rotated) */}
      <div className={`absolute bottom-1 right-1 ${getCardColor(card.suit)} ${getTextSize()} font-bold leading-none transform rotate-180`}>
        <div>{card.rank}</div>
        <div className={`${getSuitSize()} leading-none`}>{card.suit}</div>
      </div>
      
      {/* Card Border Highlight */}
      <div className="absolute inset-0 rounded-lg border border-gray-200"></div>
    </div>
  );
};