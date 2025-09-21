// /client/src/components/poker/components/CommunityCards.tsx
import React from 'react';
import { Card } from '../context/PokerGameContext';
import { CardComponent } from './CardComponent';

interface CommunityCardsProps {
  cards: Card[];
}

export const CommunityCards: React.FC<CommunityCardsProps> = ({ cards }) => {
  // Create placeholder cards for empty slots
  const displayCards = [...cards];
  while (displayCards.length < 5) {
    displayCards.push(undefined as any);
  }

  const getPhaseLabel = (cardIndex: number): string => {
    if (cardIndex < 3) return 'Flop';
    if (cardIndex === 3) return 'Turn';
    if (cardIndex === 4) return 'River';
    return '';
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-bold text-white mb-3">Community Cards</h3>
      
      {/* Cards Container */}
      <div className="flex gap-2 mb-4">
        {displayCards.map((card, index) => (
          <div key={index} className="relative">
            <CardComponent 
              card={card}
              size="large"
              className={`transition-all duration-300 ${
                card ? 'transform hover:scale-105' : 'opacity-50'
              }`}
            />
            
            {/* Phase Label */}
            {card && (
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                <span className="text-xs text-gray-400 bg-black/50 px-2 py-1 rounded">
                  {getPhaseLabel(index)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Game Phase Info */}
      <div className="text-center text-sm text-gray-300">
        {cards.length === 0 && "Waiting for flop..."}
        {cards.length === 3 && "Flop dealt - waiting for turn"}
        {cards.length === 4 && "Turn dealt - waiting for river"}
        {cards.length === 5 && "All community cards dealt"}
      </div>
    </div>
  );
};