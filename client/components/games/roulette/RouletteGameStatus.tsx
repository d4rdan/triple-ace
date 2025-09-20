// client/components/games/roulette/RouletteGameStatus.tsx
import React from 'react';
import { RouletteGameState } from '../../../types';

interface RouletteGameStatusProps {
  gameState: RouletteGameState;
  onSpin: () => void;
  canSpin: boolean;
}

const RouletteGameStatus: React.FC<RouletteGameStatusProps> = ({ 
  gameState, 
  onSpin, 
  canSpin 
}) => {
  const getNumberColor = (num: number): string => {
    if (num === 0) return 'bg-green-600';
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(num) ? 'bg-red-600' : 'bg-gray-900';
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg text-center">
      {gameState.phase === 'BETTING' && (
        <div className="space-y-4">
          <div className="text-white text-xl font-bold">
            Place Your Bets!
          </div>
          <button
            onClick={onSpin}
            disabled={!canSpin}
            className="px-8 py-3 bg-yellow-500 text-gray-900 font-bold text-lg rounded-lg 
                     hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors duration-200"
          >
            SPIN WHEEL
          </button>
        </div>
      )}
      
      {gameState.phase === 'SPINNING' && (
        <div className="space-y-4">
          <div className="text-white text-xl font-bold animate-pulse">
            🎡 Spinning...
          </div>
          <div className="text-gray-300">Please wait for the result!</div>
        </div>
      )}
      
      {gameState.phase === 'RESULTS' && gameState.winningNumber !== null && (
        <div className="space-y-4">
          <div className="text-white text-xl font-bold mb-4">
            Winning Number:
          </div>
          <div className={`inline-block px-6 py-3 rounded-lg text-white text-2xl font-bold ${
            getNumberColor(gameState.winningNumber)
          }`}>
            {gameState.winningNumber}
          </div>
          <div className="text-gray-300 mt-4">
            New round starting soon...
          </div>
        </div>
      )}
    </div>
  );
};

export default RouletteGameStatus;
