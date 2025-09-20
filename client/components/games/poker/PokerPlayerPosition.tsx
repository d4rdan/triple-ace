// client/components/games/poker/PokerPlayerPosition.tsx
import React from 'react';
import { PokerPlayer } from '../../../types';
import PokerCard from './PokerCard';

interface PokerPlayerPositionProps {
  player: PokerPlayer;
  isCurrentPlayer: boolean;
  isMe: boolean;
  showCards: boolean;
}

const PokerPlayerPosition: React.FC<PokerPlayerPositionProps> = ({
  player,
  isCurrentPlayer,
  isMe,
  showCards
}) => {
  const getPlayerStatus = () => {
    if (player.folded) return 'FOLDED';
    if (player.chips === 0) return 'ALL-IN';
    return '';
  };

  return (
    <div className={`
      bg-gray-700 p-3 rounded-lg text-white text-center min-w-32 transition-all
      ${isCurrentPlayer ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''}
      ${isMe ? 'border-2 border-blue-400' : ''}
      ${player.folded ? 'opacity-60' : ''}
    `}>
      {/* Player Info */}
      <div className="space-y-1">
        <div className="font-bold text-sm truncate">{player.username}</div>
        {isMe && <div className="text-xs text-blue-300">(You)</div>}
        <div className="text-yellow-400 text-sm font-bold">${player.chips}</div>
        
        {/* Current Bet */}
        {player.currentBet > 0 && (
          <div className="text-green-400 text-xs">
            Bet: ${player.currentBet}
          </div>
        )}
        
        {/* Player Status */}
        {getPlayerStatus() && (
          <div className="text-red-400 text-xs font-bold">
            {getPlayerStatus()}
          </div>
        )}
      </div>

      {/* Player Cards */}
      <div className="flex justify-center space-x-1 mt-2">
        {player.holeCards?.map((card, index) => (
          <div key={index} className="scale-75">
            <PokerCard
              card={card}
              faceDown={!isMe && !showCards}
              size="small"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PokerPlayerPosition;
