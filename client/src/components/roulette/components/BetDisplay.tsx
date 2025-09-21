// /client/src/components/roulette/components/BetDisplay.tsx
import React from 'react';
import { Bet } from '../hooks/useRouletteGame';

interface BetDisplayProps {
  bets: Bet[];
}

export const BetDisplay: React.FC<BetDisplayProps> = ({ bets }) => {
  const formatBetType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'straight': 'Straight',
      'red': 'Red',
      'black': 'Black',
      'odd': 'Odd',
      'even': 'Even',
      'low': '1-18',
      'high': '19-36',
      'dozen1': '1st 12',
      'dozen2': '2nd 12',
      'dozen3': '3rd 12',
      'column1': 'Col 1',
      'column2': 'Col 2',
      'column3': 'Col 3'
    };
    return typeMap[type] || type;
  };

  const getBetDescription = (bet: Bet): string => {
    if (bet.type === 'straight') {
      return `${bet.position}`;
    }
    return formatBetType(bet.type);
  };

  const getBetColor = (bet: Bet): string => {
    switch (bet.type) {
      case 'red':
        return 'border-l-red-500';
      case 'black':
        return 'border-l-gray-700';
      case 'straight':
        if (bet.position === 0) return 'border-l-green-500';
        const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        return redNumbers.includes(bet.position as number) ? 'border-l-red-500' : 'border-l-gray-700';
      case 'odd':
      case 'even':
        return 'border-l-blue-500';
      case 'low':
      case 'high':
        return 'border-l-orange-500';
      case 'dozen1':
      case 'dozen2':
      case 'dozen3':
        return 'border-l-purple-500';
      case 'column1':
      case 'column2':
      case 'column3':
        return 'border-l-indigo-500';
      default:
        return 'border-l-gray-500';
    }
  };

  if (bets.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <div className="text-4xl mb-2">🎯</div>
        <div>No bets placed</div>
        <div className="text-sm mt-1">Select a chip value and click on the table to place bets</div>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-40 overflow-y-auto">
      {bets.map((bet, index) => (
        <div
          key={bet.id}
          className={`bg-green-700/50 border-l-4 ${getBetColor(bet)} p-3 rounded-r-lg transition-all hover:bg-green-700/70`}
        >
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="font-medium">
                {getBetDescription(bet)}
              </div>
              <div className="text-xs text-gray-300 mt-1">
                {bet.numbers.length === 1 
                  ? `Number: ${bet.numbers[0]}`
                  : `${bet.numbers.length} numbers`
                }
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-yellow-400">
                ${bet.amount.toFixed(2)}
              </div>
              <div className="text-xs text-gray-300">
                Bet #{index + 1}
              </div>
            </div>
          </div>
          
          {/* Payout Information */}
          <div className="mt-2 pt-2 border-t border-green-600/30">
            <div className="text-xs text-gray-300 flex justify-between">
              <span>Potential Win:</span>
              <span className="text-green-400 font-medium">
                ${(bet.amount * (getPayoutRatio(bet.type) + 1)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      ))}
      
      {/* Summary */}
      {bets.length > 1 && (
        <div className="mt-3 p-3 bg-green-600/30 rounded-lg border border-green-500/30">
          <div className="flex justify-between items-center text-sm">
            <span>{bets.length} bet{bets.length > 1 ? 's' : ''}</span>
            <span className="font-bold">
              Total: ${bets.reduce((sum, bet) => sum + bet.amount, 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get payout ratio
const getPayoutRatio = (betType: string): number => {
  const payouts: Record<string, number> = {
    straight: 35,
    split: 17,
    street: 11,
    corner: 8,
    sixLine: 5,
    dozen1: 2,
    dozen2: 2,
    dozen3: 2,
    column1: 2,
    column2: 2,
    column3: 2,
    red: 1,
    black: 1,
    odd: 1,
    even: 1,
    low: 1,
    high: 1
  };
  return payouts[betType] || 1;
};