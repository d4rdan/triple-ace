// src/components/roulette/components/game/SpinHistory.tsx

import React from 'react';
import { RED_NUMBERS } from '../../utils/constants';

interface SpinHistoryProps {
  history: number[];
}

export const SpinHistory: React.FC<SpinHistoryProps> = ({ history }) => {
  const getNumberColor = (num: number): string => {
    if (num === 0) return 'bg-green-600';
    return RED_NUMBERS.includes(num) ? 'bg-red-600' : 'bg-gray-900';
  };

  return (
    <div className="h-full flex items-center justify-center px-4">
      <div className="flex items-center gap-2">
        <span className="text-white font-bold mr-2">Last Numbers:</span>
        <div className="flex gap-1 overflow-x-auto">
          {history.length === 0 ? (
            <span className="text-gray-400">No spins yet</span>
          ) : (
            history.map((num, index) => (
              <div
                key={index}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  text-white font-bold text-sm
                  ${getNumberColor(num)}
                  ${index === 0 ? 'ring-2 ring-yellow-400' : 'opacity-80'}
                  transition-all
                `}
              >
                {num}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};