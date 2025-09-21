// src/components/roulette/components/game/ResultsDisplay.tsx

import React from 'react';
import { Bet } from '../../types';
import { RED_NUMBERS } from '../../utils/constants';
import { isBetWinner, calculateBetWin } from '../../utils/gameLogic';

interface ResultsDisplayProps {
  winningNumber: number;
  bets: Bet[];
  totalWin: number;
  onNextRound: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  winningNumber,
  bets,
  totalWin,
  onNextRound,
}) => {
  const winningBets = bets.filter(bet => isBetWinner(bet, winningNumber));
  
  const getNumberColor = (num: number): string => {
    if (num === 0) return 'text-green-500';
    return RED_NUMBERS.includes(num) ? 'text-red-500' : 'text-white';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[1500] p-4">
      <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full border-2 border-yellow-500 shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-yellow-400">
          Round Results
        </h2>
        
        {/* Winning Number */}
        <div className="text-center mb-6">
          <p className="text-lg text-gray-300 mb-2">Winning Number</p>
          <div className={`text-6xl font-bold ${getNumberColor(winningNumber)}`}>
            {winningNumber}
          </div>
        </div>
        
        {/* Win/Loss Summary */}
        <div className="border-t border-gray-700 pt-4 mb-6">
          {totalWin > 0 ? (
            <>
              <p className="text-center text-2xl font-bold text-green-400 mb-4">
                YOU WIN: {totalWin} coins!
              </p>
              
              {/* Winning bets breakdown */}
              {winningBets.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Winning Bets:</p>
                  {winningBets.map((bet) => (
                    <div key={bet.id} className="flex justify-between text-sm">
                      <span className="text-gray-300">{bet.type} ({bet.amount})</span>
                      <span className="text-green-400">+{calculateBetWin(bet)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-2xl font-bold text-red-400">
              No Win This Round
            </p>
          )}
        </div>
        
        {/* Next Round Button */}
        <button
          onClick={onNextRound}
          className="w-full py-3 bg-yellow-500 text-gray-900 font-bold text-lg rounded-lg hover:bg-yellow-400 transition-colors"
        >
          NEXT ROUND
        </button>
      </div>
    </div>
  );
};