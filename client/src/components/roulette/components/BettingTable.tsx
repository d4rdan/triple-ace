// /client/src/components/roulette/components/BettingTable.tsx
import React from 'react';
import { Bet, BetType, ChipValue } from '../hooks/useRouletteGame';

interface BettingTableProps {
  onPlaceBet: (position: string | number, type: BetType, numbers?: number[]) => void;
  selectedChip: ChipValue;
  disabled: boolean;
  bets: Bet[];
}

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export const BettingTable: React.FC<BettingTableProps> = ({
  onPlaceBet,
  selectedChip,
  disabled,
  bets
}) => {
  const getNumberColor = (num: number): string => {
    if (num === 0) return 'bg-green-600 hover:bg-green-500';
    return RED_NUMBERS.includes(num) 
      ? 'bg-red-600 hover:bg-red-500' 
      : 'bg-gray-800 hover:bg-gray-700';
  };

  const getBetsOnPosition = (position: string | number) => {
    return bets.filter(bet => bet.position === position);
  };

  const getTotalBetAmount = (position: string | number) => {
    return getBetsOnPosition(position).reduce((sum, bet) => sum + bet.amount, 0);
  };

  const ChipStack = ({ amount }: { amount: number }) => {
    if (amount === 0) return null;
    
    return (
      <div className="absolute top-1 right-1 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
        ${amount}
      </div>
    );
  };

  return (
    <div className="bg-green-800/80 backdrop-blur-sm p-4 rounded-xl border border-green-700/50">
      <div className="max-w-4xl mx-auto">
        {/* Zero */}
        <div className="mb-4">
          <button
            onClick={() => onPlaceBet(0, 'straight')}
            disabled={disabled}
            className={`w-full h-16 ${getNumberColor(0)} text-white font-bold text-xl rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative`}
          >
            0
            <ChipStack amount={getTotalBetAmount(0)} />
          </button>
        </div>

        {/* Main Numbers Grid */}
        <div className="grid grid-cols-12 gap-1 mb-4">
          {Array.from({ length: 36 }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              onClick={() => onPlaceBet(num, 'straight')}
              disabled={disabled}
              className={`h-12 ${getNumberColor(num)} text-white font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative`}
            >
              {num}
              <ChipStack amount={getTotalBetAmount(num)} />
            </button>
          ))}
        </div>

        {/* Column Bets */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => onPlaceBet('column1', 'column1')}
            disabled={disabled}
            className="h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            Column 1
            <ChipStack amount={getTotalBetAmount('column1')} />
          </button>
          <button
            onClick={() => onPlaceBet('column2', 'column2')}
            disabled={disabled}
            className="h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            Column 2
            <ChipStack amount={getTotalBetAmount('column2')} />
          </button>
          <button
            onClick={() => onPlaceBet('column3', 'column3')}
            disabled={disabled}
            className="h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            Column 3
            <ChipStack amount={getTotalBetAmount('column3')} />
          </button>
        </div>

        {/* Dozen Bets */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => onPlaceBet('dozen1', 'dozen1')}
            disabled={disabled}
            className="h-12 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            1st 12
            <ChipStack amount={getTotalBetAmount('dozen1')} />
          </button>
          <button
            onClick={() => onPlaceBet('dozen2', 'dozen2')}
            disabled={disabled}
            className="h-12 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            2nd 12
            <ChipStack amount={getTotalBetAmount('dozen2')} />
          </button>
          <button
            onClick={() => onPlaceBet('dozen3', 'dozen3')}
            disabled={disabled}
            className="h-12 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            3rd 12
            <ChipStack amount={getTotalBetAmount('dozen3')} />
          </button>
        </div>

        {/* Outside Bets */}
        <div className="grid grid-cols-6 gap-2">
          <button
            onClick={() => onPlaceBet('red', 'red')}
            disabled={disabled}
            className="h-12 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            Red
            <ChipStack amount={getTotalBetAmount('red')} />
          </button>
          <button
            onClick={() => onPlaceBet('black', 'black')}
            disabled={disabled}
            className="h-12 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            Black
            <ChipStack amount={getTotalBetAmount('black')} />
          </button>
          <button
            onClick={() => onPlaceBet('odd', 'odd')}
            disabled={disabled}
            className="h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            Odd
            <ChipStack amount={getTotalBetAmount('odd')} />
          </button>
          <button
            onClick={() => onPlaceBet('even', 'even')}
            disabled={disabled}
            className="h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            Even
            <ChipStack amount={getTotalBetAmount('even')} />
          </button>
          <button
            onClick={() => onPlaceBet('low', 'low')}
            disabled={disabled}
            className="h-12 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            1-18
            <ChipStack amount={getTotalBetAmount('low')} />
          </button>
          <button
            onClick={() => onPlaceBet('high', 'high')}
            disabled={disabled}
            className="h-12 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            19-36
            <ChipStack amount={getTotalBetAmount('high')} />
          </button>
        </div>

        {/* Payout Information */}
        <div className="mt-4 text-center text-sm text-gray-300">
          <div className="grid grid-cols-3 gap-4">
            <div>Straight: 35:1</div>
            <div>Dozens/Columns: 2:1</div>
            <div>Even Money: 1:1</div>
          </div>
        </div>
      </div>
    </div>
  );
};