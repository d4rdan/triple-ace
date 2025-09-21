// /client/src/components/poker/components/PlayerHand.tsx
import React from 'react';
import { PokerPlayer, Card } from '../context/PokerGameContext';
import { CardComponent } from './CardComponent';

interface PlayerHandProps {
  player: PokerPlayer;
  isCurrentTurn: boolean;
  isDealer: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  isLocalPlayer?: boolean;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  player,
  isCurrentTurn,
  isDealer,
  position,
  isLocalPlayer = false
}) => {
  const getCardDisplay = (card: Card, index: number) => {
    if (isLocalPlayer || player.showCards) {
      return <CardComponent key={card.id} card={card} />;
    }
    return <CardComponent key={`hidden-${index}`} faceDown />;
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'flex-col items-center';
      case 'bottom':
        return 'flex-col items-center';
      case 'left':
        return 'flex-row items-center';
      case 'right':
        return 'flex-row-reverse items-center';
      default:
        return 'flex-col items-center';
    }
  };

  return (
    <div className={`flex ${getPositionClasses()} gap-3`}>
      {/* Player Info */}
      <div className={`text-center ${position === 'top' ? 'order-2' : 'order-1'}`}>
        <div className={`bg-black/40 backdrop-blur-sm rounded-lg p-3 border-2 transition-all ${
          isCurrentTurn 
            ? 'border-yellow-400 shadow-lg shadow-yellow-400/30' 
            : 'border-gray-600'
        }`}>
          {/* Player Name and Status */}
          <div className="flex items-center gap-2 mb-2">
            <div className={`text-sm font-bold ${
              isCurrentTurn ? 'text-yellow-400' : 'text-white'
            }`}>
              {player.name}
              {isLocalPlayer && ' (You)'}
            </div>
            
            {/* Status Indicators */}
            <div className="flex gap-1">
              {isDealer && (
                <div className="w-6 h-6 bg-white border-2 border-gray-800 rounded-full flex items-center justify-center text-xs font-bold text-gray-800">
                  D
                </div>
              )}
              {player.folded && (
                <div className="px-2 py-1 bg-red-600 text-white text-xs rounded">
                  FOLD
                </div>
              )}
              {player.allIn && (
                <div className="px-2 py-1 bg-purple-600 text-white text-xs rounded">
                  ALL-IN
                </div>
              )}
              {!player.connected && (
                <div className="px-2 py-1 bg-gray-600 text-white text-xs rounded">
                  AWAY
                </div>
              )}
            </div>
          </div>

          {/* Chip Count */}
          <div className="text-lg font-bold text-green-400 mb-1">
            ${player.chips.toLocaleString()}
          </div>

          {/* Current Bet */}
          {player.currentBet > 0 && (
            <div className="text-sm text-blue-300">
              Bet: ${player.currentBet}
            </div>
          )}

          {/* Turn Indicator */}
          {isCurrentTurn && (
            <div className="mt-2">
              <div className="w-full h-1 bg-yellow-400 rounded animate-pulse"></div>
              <div className="text-xs text-yellow-400 mt-1">Your Turn</div>
            </div>
          )}
        </div>
      </div>

      {/* Player Cards */}
      <div className={`flex gap-1 ${position === 'top' ? 'order-1' : 'order-2'} ${
        player.folded ? 'opacity-50' : ''
      }`}>
        {player.cards.map((card, index) => (
          <div key={card.id || `card-${index}`} className="transform hover:scale-105 transition-transform">
            {getCardDisplay(card, index)}
          </div>
        ))}
        
        {/* Placeholder for empty hands */}
        {player.cards.length === 0 && (
          <>
            <div className="w-12 h-16 border-2 border-dashed border-gray-500 rounded opacity-30"></div>
            <div className="w-12 h-16 border-2 border-dashed border-gray-500 rounded opacity-30"></div>
          </>
        )}
      </div>

      {/* Bet Chips Display */}
      {player.currentBet > 0 && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
            ${player.currentBet}
          </div>
        </div>
      )}
    </div>
  );
};