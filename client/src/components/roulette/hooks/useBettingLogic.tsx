// src/components/roulette/hooks/useBettingLogic.tsx

import React from 'react';
import { Bet, BetType, ChipValue } from '../types';

interface UseBettingLogicProps {
  activeBets: Bet[];
  selectedChip: ChipValue | null;
  onPlaceBet: (position: string | number, type: BetType, numbers: number[]) => void;
  disabled: boolean;
}

const roundToTwo = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

const formatChipAmount = (amount: number): string => {
  return Number(amount.toFixed(2)).toString();
};

export const useBettingLogic = ({
  activeBets,
  selectedChip,
  onPlaceBet,
  disabled,
}: UseBettingLogicProps) => {
  
  const getBetAmount = (position: string | number): number => {
    const total = activeBets
      .filter(bet => bet.position === position)
      .reduce((sum, bet) => sum + bet.amount, 0);
    return roundToTwo(total);
  };

  const renderChipStack = (position: string | number, size: 'mobile' | 'desktop' = 'desktop') => {
    const amount = getBetAmount(position);
    if (amount === 0) return null;

    const chipSize = size === 'mobile' 
      ? 'w-5 h-5 text-[7px]' 
      : 'w-7 h-7 md:w-8 md:h-8 text-[9px] md:text-[10px]';

    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="relative">
          <div className={`${chipSize} rounded-full flex items-center justify-center
                          bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 
                          border-2 border-yellow-700 shadow-lg relative overflow-hidden`}>
            <div className="absolute inset-1 rounded-full border border-yellow-300/40"></div>
            <div className="absolute inset-0 rounded-full">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-full h-0.5 bg-yellow-800/30"
                  style={{
                    top: '50%',
                    transform: `rotate(${i * 22.5}deg)`,
                    transformOrigin: 'center',
                  }}
                />
              ))}
            </div>
            <span className="font-bold text-gray-900 relative z-10 drop-shadow">
              {formatChipAmount(amount)}
            </span>
          </div>
          
          {amount > 5 && (
            <div className={`absolute -bottom-1 left-0 ${chipSize} rounded-full 
                            bg-gradient-to-br from-yellow-500 to-yellow-700
                            border-2 border-yellow-800 -z-10 shadow-md`} />
          )}
          {amount > 20 && (
            <div className={`absolute -bottom-2 left-0 ${chipSize} rounded-full 
                            bg-gradient-to-br from-yellow-600 to-yellow-800
                            border-2 border-yellow-900 -z-20 shadow-sm`} />
          )}
        </div>
      </div>
    );
  };

  const handleNumberClick = (num: number) => {
    if (!disabled && selectedChip) {
      onPlaceBet(num, 'straight', [num]);
    }
  };

  const handleSplitClick = (nums: number[], position: string) => {
    if (!disabled && selectedChip) {
      onPlaceBet(position, 'split', nums);
    }
  };

  const handleCornerClick = (nums: number[], position: string) => {
    if (!disabled && selectedChip) {
      onPlaceBet(position, 'corner', nums);
    }
  };

  const handleStreetClick = (nums: number[], position: string) => {
    if (!disabled && selectedChip) {
      onPlaceBet(position, 'street', nums);
    }
  };

  const handleSixLineClick = (nums: number[], position: string) => {
    if (!disabled && selectedChip) {
      onPlaceBet(position, 'sixLine', nums);
    }
  };

  const handleOutsideClick = (position: string, type: BetType, numbers: number[]) => {
    if (!disabled && selectedChip) {
      onPlaceBet(position, type, numbers);
    }
  };

  return {
    getBetAmount,
    renderChipStack,
    handleNumberClick,
    handleSplitClick,
    handleCornerClick,
    handleStreetClick,
    handleSixLineClick,
    handleOutsideClick,
  };
};