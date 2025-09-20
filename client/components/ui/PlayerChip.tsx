// client/components/ui/PlayerChip.tsx
import React from 'react';

interface PlayerChipProps {
  value: number;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const PlayerChip: React.FC<PlayerChipProps> = ({ value, isSelected, onClick, disabled = false }) => {
  const getChipColor = () => {
    switch (value) {
      case 5: return 'bg-red-600 hover:bg-red-700';
      case 10: return 'bg-blue-600 hover:bg-blue-700';
      case 25: return 'bg-green-600 hover:bg-green-700';
      case 50: return 'bg-orange-600 hover:bg-orange-700';
      case 100: return 'bg-purple-600 hover:bg-purple-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-12 h-12 rounded-full text-white font-bold transition-all transform
        ${getChipColor()}
        ${isSelected ? 'ring-2 ring-yellow-400 scale-110' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
      `}
    >
      {value}
    </button>
  );
};

export default PlayerChip;