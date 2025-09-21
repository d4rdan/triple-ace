// src/components/roulette/components/game/ChipSelector.tsx

import React from 'react';
import { ChipValue } from '../../types';
import { CHIP_VALUES } from '../../utils/constants';
import { useGame } from '../../context/GameContext';

interface ChipSelectorProps {
  selectedChip: ChipValue | null;
  playerCoins: number;
  onSelectChip: (chip: ChipValue | null) => void;
}

const formatChipAmount = (amount: number): string => {
  return Number(amount.toFixed(2)).toString();
};

export const ChipSelector: React.FC<ChipSelectorProps> = ({
  selectedChip,
  playerCoins,
  onSelectChip,
}) => {
  const game = useGame();
  
  const getChipStyle = (value: ChipValue) => {
    switch (value) {
      case 0.1:
        return 'bg-red-500 border-red-700';
      case 1:
        return 'bg-blue-500 border-blue-700';
      case 5:
        return 'bg-green-500 border-green-700';
      case 10:
        return 'bg-orange-500 border-orange-700';
      case 20:
        return 'bg-purple-500 border-purple-700';
      default:
        return 'bg-gray-500 border-gray-700';
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-white text-lg font-bold">Select Chip Value</h3>
        {game.isLoadingBalance && (
          <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-4 justify-center">
        {CHIP_VALUES.map((value) => {
          const isDisabled = value > playerCoins || game.phase !== 'BETTING' || game.isLoadingBalance;
          const isSelected = selectedChip === value;
          const chipStyle = getChipStyle(value);

          return (
            <button
              key={value}
              onClick={() => onSelectChip(isSelected ? null : value)}
              disabled={isDisabled}
              style={{
                width: '64px',
                height: '64px',
                minWidth: '64px',
                minHeight: '64px'
              }}
              className={`
                rounded-full border-3 shadow-lg transition-all transform
                ${chipStyle}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                ${isSelected ? 'scale-110 ring-3 ring-yellow-400' : ''}
                flex items-center justify-center
                font-bold text-white text-sm
              `}
            >
              {formatChipAmount(value)}
              {isSelected && (
                <div 
                  className="absolute bg-yellow-400 rounded-full flex items-center justify-center"
                  style={{
                    width: '16px',
                    height: '16px',
                    top: '-4px',
                    right: '-4px'
                  }}
                >
                  <span className="text-yellow-900 text-xs font-bold">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {selectedChip && (
        <div className="mt-4 text-center">
          <p className="text-yellow-400 text-sm font-semibold">
            Selected: {formatChipAmount(selectedChip)} coins
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Available: {formatChipAmount(playerCoins)} coins
          </p>
        </div>
      )}
      
      {game.error && (
        <div className="mt-3 bg-red-600/20 border border-red-500 rounded-lg p-2 max-w-[250px]">
          <p className="text-red-400 text-xs text-center">
            {game.error}
          </p>
        </div>
      )}
    </div>
  );
};