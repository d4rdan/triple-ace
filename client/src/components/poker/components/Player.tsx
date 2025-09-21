// client/src/components/poker/components/Player.tsx

import React from 'react';
import { Player as PlayerType } from '../types';
import { Card } from './Card';

interface PlayerProps {
  player: PlayerType;
  isCurrentPlayer: boolean;
  isLocalPlayer: boolean;
  dealerPosition: number;
  showCards?: boolean;
}

export const PlayerComponent: React.FC<PlayerProps> = ({
  player,
  isCurrentPlayer,
  isLocalPlayer,
  dealerPosition,
  showCards = false,
}) => {
  const isDealer = player.position === dealerPosition;
  
  return (
    <div className="relative">
      {/* Dealer button */}
      {isDealer && (
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-white shadow-lg z-20">
          D
        </div>
      )}
      
      {/* Player name and chips - floating above cards */}
      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 text-center min-w-[120px]">
        <div className={`font-bold text-sm mb-1 px-2 py-1 rounded shadow-lg ${
          isLocalPlayer ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'
        } ${isCurrentPlayer ? 'ring-2 ring-yellow-400' : ''}`}>
          {player.name}
          {isLocalPlayer && ' (You)'}
        </div>
        
        <div className="text-xs text-white bg-black bg-opacity-70 px-2 py-1 rounded">
          💰 ${player.chips}
        </div>
        
        {player.currentBet > 0 && (
          <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold mt-1">
            Bet: ${player.currentBet}
          </div>
        )}
      </div>
      
      {/* Player cards - same size as community cards */}
      <div className="flex gap-2">
        {player.hand.length > 0 ? (
          player.hand.map((card, index) => (
            <Card
              key={index}
              card={card}
              faceDown={!isLocalPlayer && !showCards}
              size="large"
              className={`transform hover:scale-105 transition-transform ${
                player.isFolded ? 'opacity-60 grayscale' : ''
              }`}
            />
          ))
        ) : (
          // Show empty card slots
          <>
            <div className="w-16 h-24 bg-gray-200 border-2 border-gray-300 rounded flex items-center justify-center">
              <span className="text-gray-400 text-sm">?</span>
            </div>
            <div className="w-16 h-24 bg-gray-200 border-2 border-gray-300 rounded flex items-center justify-center">
              <span className="text-gray-400 text-sm">?</span>
            </div>
          </>
        )}
      </div>
      
      {/* Player status - floating below cards */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1">
        {player.isFolded && (
          <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            Folded
          </span>
        )}
        {player.isAllIn && (
          <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold">
            All-in
          </span>
        )}
        {isCurrentPlayer && !player.isFolded && (
          <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold animate-pulse">
            Your Turn
          </span>
        )}
      </div>
      
      {/* Last action - floating further below */}
      {player.lastAction && (
        <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 text-xs text-white bg-black bg-opacity-70 px-2 py-1 rounded">
          {player.lastAction}
        </div>
      )}
    </div>
  );
};