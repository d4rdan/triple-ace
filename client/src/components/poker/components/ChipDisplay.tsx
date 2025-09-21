// /client/src/components/poker/components/ChipDisplay.tsx
import React from 'react';

interface ChipDisplayProps {
  amount: number;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

export const ChipDisplay: React.FC<ChipDisplayProps> = ({
  amount,
  size = 'medium',
  animated = false
}) => {
  const getChipColor = (value: number): string => {
    if (value >= 1000) return 'from-purple-500 to-purple-700 border-purple-400';
    if (value >= 500) return 'from-pink-500 to-pink-700 border-pink-400';
    if (value >= 100) return 'from-green-500 to-green-700 border-green-400';
    if (value >= 50) return 'from-blue-500 to-blue-700 border-blue-400';
    if (value >= 25) return 'from-red-500 to-red-700 border-red-400';
    if (value >= 10) return 'from-yellow-500 to-yellow-700 border-yellow-400';
    if (value >= 5) return 'from-orange-500 to-orange-700 border-orange-400';
    return 'from-gray-400 to-gray-600 border-gray-300';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8 text-xs';
      case 'large':
        return 'w-16 h-16 text-lg';
      case 'medium':
      default:
        return 'w-12 h-12 text-sm';
    }
  };

  const formatAmount = (amount: number): string => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toString();
  };

  // Calculate chip stack representation
  const getChipStack = () => {
    const denominations = [1000, 500, 100, 50, 25, 10, 5, 1];
    const chips = [];
    let remaining = amount;

    for (const denom of denominations) {
      const count = Math.floor(remaining / denom);
      if (count > 0) {
        chips.push({ value: denom, count: Math.min(count, 5) }); // Max 5 chips per stack for display
        remaining -= count * denom;
      }
    }

    return chips;
  };

  const chipStacks = getChipStack();

  if (amount === 0) {
    return (
      <div className={`${getSizeClasses()} rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center opacity-50`}>
        <span className="text-gray-500">$0</span>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-1">
      {chipStacks.map((stack, index) => (
        <div key={stack.value} className="relative">
          {/* Chip Stack */}
          <div className="relative">
            {Array.from({ length: stack.count }).map((_, chipIndex) => (
              <div
                key={chipIndex}
                className={`
                  ${getSizeClasses()}
                  absolute bottom-0 left-0
                  bg-gradient-to-br ${getChipColor(stack.value)}
                  rounded-full border-2 flex items-center justify-center
                  font-bold text-white shadow-lg
                  ${animated ? 'animate-pulse' : ''}
                `}
                style={{
                  transform: `translateY(-${chipIndex * 2}px)`,
                  zIndex: chipIndex,
                }}
              >
                {chipIndex === stack.count - 1 && (
                  <span className="text-shadow">
                    {stack.value >= 1000 ? `${stack.value / 1000}K` : stack.value}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Stack Count */}
          {stack.count > 1 && (
            <div className="absolute -top-2 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {stack.count}
            </div>
          )}
        </div>
      ))}

      {/* Total Amount */}
      <div className="ml-2 text-center">
        <div className="text-xs text-gray-400">Total</div>
        <div className="font-bold text-white">${formatAmount(amount)}</div>
      </div>
    </div>
  );
};