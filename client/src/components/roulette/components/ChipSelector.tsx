// /client/src/components/roulette/components/ChipSelector.tsx
import React from 'react';
import { ChipValue } from '../hooks/useRouletteGame';

interface ChipSelectorProps {
  selectedChip: ChipValue;
  onChipSelect: (value: ChipValue) => void;
  disabled: boolean;
}

const CHIP_VALUES: ChipValue[] = [0.1, 1, 5, 10, 20];

const getChipColor = (value: ChipValue): string => {
  switch (value) {
    case 0.1: return 'from-gray-400 to-gray-600 border-gray-300';
    case 1: return 'from-red-400 to-red-600 border-red-300';
    case 5: return 'from-blue-400 to-blue-600 border-blue-300';
    case 10: return 'from-green-400 to-green-600 border-green-300';
    case 20: return 'from-yellow-400 to-yellow-600 border-yellow-300';
    default: return 'from-gray-400 to-gray-600 border-gray-300';
  }
};

export const ChipSelector: React.FC<ChipSelectorProps> = ({
  selectedChip,
  onChipSelect,
  disabled
}) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {CHIP_VALUES.map(value => (
        <button
          key={value}
          onClick={() => onChipSelect(value)}
          disabled={disabled}
          className={`
            relative w-16 h-16 rounded-full border-4 font-bold text-black
            transition-all duration-200 transform hover:scale-110 disabled:hover:scale-100
            disabled:opacity-50 disabled:cursor-not-allowed
            bg-gradient-to-br ${getChipColor(value)}
            ${selectedChip === value 
              ? 'ring-4 ring-yellow-400 scale-110 shadow-lg' 
              : 'hover:shadow-md'
            }
          `}
        >
          {/* Chip Design */}
          <div className="absolute inset-2 rounded-full bg-white/20 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs font-bold">${value}</div>
            </div>
          </div>
          
          {/* Chip Pattern */}
          <div className="absolute inset-1 rounded-full border-2 border-white/30"></div>
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/50 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Selection Indicator */}
          {selectedChip === value && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};