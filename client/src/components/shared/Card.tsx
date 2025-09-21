// /client/src/components/shared/Card.tsx
import React from 'react';

export interface CardData {
  id: string;
  suit: '♠' | '♥' | '♦' | '♣';
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
  value?: number;
}

interface SharedCardProps {
  card?: CardData;
  faceDown?: boolean;
  size?: 'small' | 'medium' | 'large' | 'xl';
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  animate?: boolean;
}

export const Card: React.FC<SharedCardProps> = ({
  card,
  faceDown = false,
  size = 'medium',
  className = '',
  onClick,
  selected = false,
  disabled = false,
  animate = false
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-12';
      case 'large':
        return 'w-16 h-24';
      case 'xl':
        return 'w-20 h-28';
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
        return 'text-lg';
      case 'xl':
        return 'text-xl';
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
        return 'text-2xl';
      case 'xl':
        return 'text-3xl';
      case 'medium':
      default:
        return 'text-lg';
    }
  };

  const getCardColor = (suit?: string): string => {
    if (!suit) return 'text-black';
    return suit === '♥' || suit === '♦' ? 'text-red-600' : 'text-black';
  };

  const baseClasses = `
    ${getSizeClasses()}
    rounded-lg border-2 flex flex-col relative overflow-hidden shadow-lg
    transition-all duration-200
    ${onClick && !disabled ? 'cursor-pointer hover:scale-105' : ''}
    ${selected ? 'ring-2 ring-yellow-400 transform scale-105' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${animate ? 'animate-pulse' : ''}
    ${className}
  `;

  if (faceDown) {
    return (
      <div 
        className={`${baseClasses} bg-gradient-to-br from-blue-600 to-blue-800 border-blue-400`}
        onClick={onClick && !disabled ? onClick : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white opacity-80">
            <div className={`${getSuitSize()}`}>🂠</div>
          </div>
        </div>
        {/* Card back pattern */}
        <div className="absolute inset-2 border border-blue-300 rounded opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-300 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
      </div>
    );
  }

  if (!card) {
    return (
      <div 
        className={`${baseClasses} border-dashed border-gray-400 bg-gray-100`}
        onClick={onClick && !disabled ? onClick : undefined}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400 text-lg">?</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${baseClasses} bg-white border-gray-300`}
      onClick={onClick && !disabled ? onClick : undefined}
    >
      {/* Card Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50"></div>
      
      {/* Top Left Corner */}
      <div className={`absolute top-1 left-1 ${getCardColor(card.suit)} ${getTextSize()} font-bold leading-none`}>
        <div>{card.rank}</div>
        <div className={`${getSuitSize()} leading-none mt-0.5`}>{card.suit}</div>
      </div>
      
      {/* Center Suit (larger cards only) */}
      {(size === 'large' || size === 'xl') && (
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${getCardColor(card.suit)}`}>
          <div className={`${getSuitSize()} opacity-15`}>{card.suit}</div>
        </div>
      )}
      
      {/* Bottom Right Corner (Rotated) */}
      <div className={`absolute bottom-1 right-1 ${getCardColor(card.suit)} ${getTextSize()} font-bold leading-none transform rotate-180`}>
        <div>{card.rank}</div>
        <div className={`${getSuitSize()} leading-none mt-0.5`}>{card.suit}</div>
      </div>
      
      {/* Selection indicator */}
      {selected && (
        <div className="absolute inset-0 bg-yellow-400/20 rounded-lg"></div>
      )}
      
      {/* Card shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
    </div>
  );
};