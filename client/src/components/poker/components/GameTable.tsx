// client/src/components/poker/components/GameTable.tsx

import React from 'react';
import { PokerGameState } from '../types';
import { PlayerComponent } from './Player';
import { Card } from './Card';

interface GameTableProps {
  gameState: PokerGameState;
  localPlayerId: string;
  onAction: (action: any) => void;
}

export const GameTable: React.FC<GameTableProps> = ({
  gameState,
  localPlayerId,
  onAction,
}) => {
  const players = Object.values(gameState.players);
  const localPlayer = gameState.players[localPlayerId];
  const isCurrentPlayer = gameState.currentPlayer === localPlayerId;
  
  const canCheck = () => {
    return localPlayer && localPlayer.currentBet === gameState.currentBet;
  };
  
  const getCallAmount = () => {
    if (!localPlayer) return 0;
    return gameState.currentBet - localPlayer.currentBet;
  };

  const handleAction = (action: string, amount?: number) => {
    onAction({ type: action, amount });
  };

  // Position players around the table
  const getPlayerPosition = (position: number, totalPlayers: number) => {
    const positions = {
      2: ['bottom', 'top'],
      3: ['bottom', 'left', 'right'],
      4: ['bottom', 'left', 'top', 'right']
    };
    return positions[totalPlayers as keyof typeof positions]?.[position] || 'bottom';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-900 to-green-800 p-4">
      {/* Game info header */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-white mb-2">Texas Hold'em Poker</h1>
        <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg inline-block">
          {gameState.message}
        </div>
      </div>

      {/* Main game container */}
      <div className="max-w-6xl mx-auto relative">
        {/* Poker table */}
        <div className="relative">
          {/* Table background */}
          <div className="bg-green-700 rounded-full mx-auto border-8 border-amber-600 shadow-2xl relative overflow-hidden"
               style={{ width: '1000px', height: '600px' }}>
            
            {/* Table felt pattern */}
            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-green-600 to-green-800"></div>
            
            {/* Pot indicator - moved inside table, top area */}
            <div className="absolute top-1/2 left-10 transform -translate-x-1/2">
              <div className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold text-lg shadow-lg border-2 border-yellow-600">
                Pot: ${gameState.pot}
              </div>
            </div>

            {/* Center area with community cards only */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                {/* Community cards */}
                <div className="flex justify-center gap-3">
                  {gameState.communityCards.map((card, index) => (
                    <Card key={index} card={card} size="large" />
                  ))}
                  {/* Empty slots for future community cards */}
                  {Array.from({ length: 5 - gameState.communityCards.length }).map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="w-16 h-24 border-2 border-dashed border-gray-300 rounded-lg bg-green-600 bg-opacity-30 flex items-center justify-center"
                    >
                      <span className="text-gray-300 text-sm">?</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Players positioned around the table */}
            <div className="absolute inset-0">
              {players.map((player, index) => {
                const totalPlayers = players.length;
                let positionClass = '';
                
                // Position players around the oval table - adjusted for floating layout
                if (totalPlayers === 2) {
                  positionClass = index === 0 ? 'bottom-16 left-1/2 transform -translate-x-1/2' : 'top-16 left-1/2 transform -translate-x-1/2';
                } else if (totalPlayers === 3) {
                  const positions = [
                    'bottom-16 left-1/2 transform -translate-x-1/2', 
                    'top-1/2 left-16 transform -translate-y-1/2', 
                    'top-1/2 right-16 transform -translate-y-1/2'
                  ];
                  positionClass = positions[index];
                } else if (totalPlayers === 4) {
                  const positions = [
                    'bottom-16 left-1/2 transform -translate-x-1/2',
                    'top-1/2 left-16 transform -translate-y-1/2', 
                    'top-16 left-1/2 transform -translate-x-1/2',
                    'top-1/2 right-16 transform -translate-y-1/2'
                  ];
                  positionClass = positions[index];
                }

                return (
                  <div key={player.id} className={`absolute ${positionClass} z-10`}>
                    <PlayerComponent
                      player={player}
                      isCurrentPlayer={gameState.currentPlayer === player.id}
                      isLocalPlayer={player.id === localPlayerId}
                      dealerPosition={gameState.dealerPosition}
                      showCards={gameState.phase === 'showdown'}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action buttons for current player */}
        {isCurrentPlayer && localPlayer && !localPlayer.isFolded && gameState.gameStarted && (
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => handleAction('fold')}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg"
            >
              Fold
            </button>
            
            {canCheck() ? (
              <button
                onClick={() => handleAction('check')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg"
              >
                Check
              </button>
            ) : (
              <button
                onClick={() => handleAction('call')}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg"
                disabled={getCallAmount() > localPlayer.chips}
              >
                Call ${getCallAmount()}
              </button>
            )}
            
            <button
              onClick={() => handleAction('raise', gameState.bigBlind)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg"
              disabled={localPlayer.chips < gameState.bigBlind}
            >
              Raise ${gameState.bigBlind}
            </button>
          </div>
        )}

        {/* Game stats */}
        <div className="mt-6 flex justify-center gap-8 text-white">
          <div className="text-center bg-black bg-opacity-30 px-4 py-3 rounded-lg">
            <div className="text-sm opacity-75">Small Blind</div>
            <div className="font-bold text-lg">${gameState.smallBlind}</div>
          </div>
          <div className="text-center bg-black bg-opacity-30 px-4 py-3 rounded-lg">
            <div className="text-sm opacity-75">Big Blind</div>
            <div className="font-bold text-lg">${gameState.bigBlind}</div>
          </div>
          <div className="text-center bg-black bg-opacity-30 px-4 py-3 rounded-lg">
            <div className="text-sm opacity-75">Round</div>
            <div className="font-bold text-lg">{gameState.roundNumber}</div>
          </div>
        </div>
      </div>
    </div>
  );
};