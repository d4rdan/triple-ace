// client/components/games/poker/PokerTable.tsx
import React from 'react';
import { PokerPlayer, PokerGameState, Card } from '../../../types';
import PokerPlayerPosition from './PokerPlayerPosition';
import PokerCard from './PokerCard';

interface PokerTableProps {
  players: PokerPlayer[];
  gameState: PokerGameState;
  currentPlayerId: string;
}

const PokerTable: React.FC<PokerTableProps> = ({
  players,
  gameState,
  currentPlayerId
}) => {
  const myPlayer = players.find(p => p.id === currentPlayerId);
  const otherPlayers = players.filter(p => p.id !== currentPlayerId);

  return (
    <div className="bg-green-800 rounded-lg p-8 relative min-h-96">
      {/* Pot Display */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-gray-900 text-yellow-400 px-4 py-2 rounded-lg text-center">
          <div className="text-sm">POT</div>
          <div className="text-xl font-bold">${gameState.pot}</div>
        </div>
      </div>

      {/* Community Cards */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10">
        <h3 className="text-white text-center mb-2 text-sm">Community Cards</h3>
        <div className="flex space-x-2 justify-center">
          {[0, 1, 2, 3, 4].map(index => (
            <div key={index}>
              {gameState.communityCards[index] ? (
                <PokerCard 
                  card={gameState.communityCards[index]} 
                  size="small"
                />
              ) : (
                <div className="w-12 h-16 border-2 border-dashed border-gray-500 rounded-lg"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Other Players positioned around table */}
      <div className="absolute inset-0 p-4">
        {otherPlayers.map((player, index) => {
          const positions = [
            'top-4 left-1/2 transform -translate-x-1/2',  // Top center
            'top-4 left-4',                               // Top left
            'top-4 right-4',                              // Top right
            'right-4 top-1/2 transform -translate-y-1/2', // Right center
            'left-4 top-1/2 transform -translate-y-1/2',  // Left center
          ];

          return (
            <div key={player.id} className={`absolute ${positions[index] || 'bottom-4 left-4'}`}>
              <PokerPlayerPosition
                player={player}
                isCurrentPlayer={gameState.currentPlayer === player.position}
                isMe={false}
                showCards={gameState.phase === 'SHOWDOWN'}
              />
            </div>
          );
        })}
      </div>

      {/* My Player (bottom center) */}
      {myPlayer && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <PokerPlayerPosition
            player={myPlayer}
            isCurrentPlayer={gameState.currentPlayer === myPlayer.position}
            isMe={true}
            showCards={true}
          />
        </div>
      )}
    </div>
  );
};

export default PokerTable;