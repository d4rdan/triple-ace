// /client/src/components/roulette/components/SpinHistory.tsx
import React from 'react';

interface SpinHistoryProps {
  history: number[];
  showAll?: boolean;
}

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export const SpinHistory: React.FC<SpinHistoryProps> = ({ history, showAll = false }) => {
  const getNumberColor = (num: number): string => {
    if (num === 0) return 'bg-green-600 border-green-400';
    return RED_NUMBERS.includes(num) 
      ? 'bg-red-600 border-red-400' 
      : 'bg-gray-800 border-gray-600';
  };

  const displayHistory = showAll ? history : history.slice(0, 10);

  if (history.length === 0) {
    return (
      <div className="text-center text-gray-400 py-4">
        No spins yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Grid Display */}
      <div className={`grid gap-2 ${showAll ? 'grid-cols-5' : 'grid-cols-5'}`}>
        {displayHistory.map((num, idx) => (
          <div
            key={`${num}-${idx}`}
            className={`
              w-10 h-10 ${getNumberColor(num)} 
              rounded-full flex items-center justify-center 
              text-sm font-bold text-white border-2
              ${idx === 0 ? 'ring-2 ring-yellow-400 animate-pulse' : ''}
            `}
          >
            {num}
          </div>
        ))}
      </div>

      {/* Statistics */}
      {showAll && history.length > 0 && (
        <div className="mt-4 p-3 bg-green-700/30 rounded-lg">
          <h4 className="font-bold mb-2">Statistics</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              Red: {history.filter(n => RED_NUMBERS.includes(n)).length}
            </div>
            <div>
              Black: {history.filter(n => [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35].includes(n)).length}
            </div>
            <div>
              Zero: {history.filter(n => n === 0).length}
            </div>
            <div>
              Total: {history.length}
            </div>
          </div>
        </div>
      )}

      {/* Hot/Cold Numbers */}
      {showAll && history.length >= 10 && (
        <div className="mt-4 space-y-2">
          <div className="p-2 bg-red-600/20 rounded">
            <div className="text-xs font-bold mb-1">Hot Numbers</div>
            <div className="flex flex-wrap gap-1">
              {getHotNumbers(history).map(num => (
                <span key={num} className={`w-6 h-6 ${getNumberColor(num)} rounded text-xs flex items-center justify-center`}>
                  {num}
                </span>
              ))}
            </div>
          </div>
          
          <div className="p-2 bg-blue-600/20 rounded">
            <div className="text-xs font-bold mb-1">Cold Numbers</div>
            <div className="flex flex-wrap gap-1">
              {getColdNumbers(history).map(num => (
                <span key={num} className={`w-6 h-6 ${getNumberColor(num)} rounded text-xs flex items-center justify-center opacity-60`}>
                  {num}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get hot numbers (appeared most frequently)
const getHotNumbers = (history: number[]): number[] => {
  const frequency: Record<number, number> = {};
  
  // Count frequency of each number
  history.forEach(num => {
    frequency[num] = (frequency[num] || 0) + 1;
  });
  
  // Get numbers sorted by frequency (descending)
  const sorted = Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .map(([num]) => parseInt(num));
  
  // Return top 5 hot numbers
  return sorted.slice(0, 5);
};

// Helper function to get cold numbers (haven't appeared recently or at all)
const getColdNumbers = (history: number[]): number[] => {
  const allNumbers = Array.from({ length: 37 }, (_, i) => i);
  const recentHistory = history.slice(0, 20); // Last 20 spins
  
  // Find numbers that haven't appeared in recent history
  const coldNumbers = allNumbers.filter(num => !recentHistory.includes(num));
  
  // Return up to 5 cold numbers
  return coldNumbers.slice(0, 5);
};