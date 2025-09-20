// client/components/games/roulette/RouletteTable.tsx
import React from 'react';
import PlayerChip from '../../ui/PlayerChip';

interface RouletteTableProps {
  onPlaceBet: (type: string, numbers: number[]) => void;
  selectedChip: number;
  onChipSelect: (value: number) => void;
  disabled: boolean;
}

const RouletteTable: React.FC<RouletteTableProps> = ({
  onPlaceBet,
  selectedChip,
  onChipSelect,
  disabled
}) => {
  const chipValues = [5, 10, 25, 50, 100];
  
  const getNumberColor = (num: number): string => {
    if (num === 0) return 'bg-green-600';
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(num) ? 'bg-red-600' : 'bg-gray-900';
  };

  return (
    <div className="space-y-6">
      {/* Chip Selection */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-white font-bold mb-3 text-center">Select Chip Value</h3>
        <div className="flex justify-center space-x-3">
          {chipValues.map(value => (
            <PlayerChip
              key={value}
              value={value}
              isSelected={selectedChip === value}
              onClick={() => onChipSelect(value)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>

      {/* Roulette Numbers Grid */}
      <div className="bg-green-700 p-4 rounded-lg">
        <h3 className="text-white font-bold mb-4 text-center">Place Your Bets</h3>
        
        {/* Main Numbers Grid */}
        <div className="grid grid-cols-13 gap-1 max-w-4xl mx-auto mb-4">
          {/* Zero */}
          <button
            onClick={() => onPlaceBet('straight', [0])}
            disabled={disabled}
            className="col-span-1 h-12 bg-green-600 text-white font-bold border border-white 
                     hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed 
                     transition-colors duration-150"
          >
            0
          </button>
          
          {/* Numbers 1-36 */}
          {[...Array(36)].map((_, i) => {
            const num = i + 1;
            return (
              <button
                key={num}
                onClick={() => onPlaceBet('straight', [num])}
                disabled={disabled}
                className={`h-12 text-white font-bold border border-white 
                         hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed 
                         transition-all duration-150 ${getNumberColor(num)}`}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* Outside Bets */}
        <div className="grid grid-cols-6 gap-2 max-w-4xl mx-auto">
          <button
            onClick={() => onPlaceBet('red', [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36])}
            disabled={disabled}
            className="h-12 bg-red-600 text-white font-bold border border-white 
                     hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            RED
          </button>
          <button
            onClick={() => onPlaceBet('black', [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35])}
            disabled={disabled}
            className="h-12 bg-gray-900 text-white font-bold border border-white 
                     hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            BLACK
          </button>
          <button
            onClick={() => onPlaceBet('odd', [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35])}
            disabled={disabled}
            className="h-12 bg-gray-700 text-white font-bold border border-white 
                     hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ODD
          </button>
          <button
            onClick={() => onPlaceBet('even', [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36])}
            disabled={disabled}
            className="h-12 bg-gray-700 text-white font-bold border border-white 
                     hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            EVEN
          </button>
          <button
            onClick={() => onPlaceBet('low', [...Array(18)].map((_, i) => i + 1))}
            disabled={disabled}
            className="h-12 bg-gray-700 text-white font-bold border border-white 
                     hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            1-18
          </button>
          <button
            onClick={() => onPlaceBet('high', [...Array(18)].map((_, i) => i + 19))}
            disabled={disabled}
            className="h-12 bg-gray-700 text-white font-bold border border-white 
                     hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            19-36
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouletteTable;