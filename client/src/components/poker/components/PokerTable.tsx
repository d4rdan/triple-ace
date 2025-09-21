// /client/src/components/poker/components/PokerTable.tsx - Fixed imports
import React from 'react';
import { usePokerGame } from '../context/PokerGameContext';
import { PlayerHand } from './PlayerHand';
import { CommunityCards } from './CommunityCards';
import { ChipDisplay } from './ChipDisplay';

export const PokerTable: React.FC = () => {
  const { gameState, playerId, myPlayer } = usePokerGame();

  if (!gameState) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white/60">
          <div className="text-4xl mb-4">🃏</div>
          <div>Waiting for game state...</div>
        </div>
      </div>
    );
  }

  const players = gameState.players || [];
  const otherPlayers = players.filter(p => p && p.id !== playerId);

  // Position players around the table
  const getPlayerPosition = (index: number, total: number) => {
    if (total === 0) return { x: 50, y: 50 };
    
    const angle = (index / total) * 2 * Math.PI;
    const radius = 35; // Percentage from center
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    return { x, y };
  };

  return (
    <div className="flex-1 relative bg-gradient-to-br from-green-800 to-green-900 overflow-hidden">
      {/* Table Surface */}
      <div className="absolute inset-4 bg-green-700 rounded-full border-8 border-yellow-600 shadow-2xl">
        {/* Table Felt Pattern */}
        <div className="w-full h-full rounded-full bg-gradient-radial from-green-600 to-green-800 relative">
          {/* Center Area */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            {/* Community Cards */}
            <CommunityCards cards={gameState.communityCards || []} />
            
            {/* Pot Display */}
            <div className="mt-6">
              <div className="bg-black/30 backdrop-blur-sm rounded-lg px-6 py-3 border border-yellow-500/50">
                <div className="text-sm text-yellow-200">Total Pot</div>
                <div className="text-2xl font-bold text-yellow-400">
                  ${(gameState.pot || 0).toLocaleString()}
                </div>
                {gameState.currentBet > 0 && (
                  <div className="text-sm text-blue-200 mt-1">
                    Current Bet: ${gameState.currentBet}
                  </div>
                )}
              </div>
            </div>

            {/* Game Phase */}
            <div className="mt-4">
              <div className="bg-blue-600/20 backdrop-blur-sm rounded-full px-4 py-2 border border-blue-400/30">
                <div className="text-sm font-medium text-blue-200 capitalize">
                  {gameState.gamePhase.replace('-', ' ')}
                </div>
              </div>
            </div>
          </div>

          {/* Dealer Button */}
          {gameState.dealerPosition >= 0 && players.length > 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div 
                className="absolute w-8 h-8 bg-white border-2 border-gray-800 rounded-full flex items-center justify-center text-xs font-bold text-gray-800"
                style={{
                  transform: `translate(${Math.cos(gameState.dealerPosition * (2 * Math.PI / players.length)) * 120}px, ${Math.sin(gameState.dealerPosition * (2 * Math.PI / players.length)) * 120}px)`
                }}
              >
                D
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Other Players */}
      {otherPlayers.map((player, index) => {
        if (!player || !player.id) return null;
        
        const position = getPlayerPosition(index, otherPlayers.length);
        return (
          <div
            key={player.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
            }}
          >
            <PlayerHand
              player={player}
              isCurrentTurn={gameState.currentTurn === player.id}
              isDealer={player.isDealer}
              position="top"
            />
          </div>
        );
      })}

      {/* Current Player (Bottom) */}
      {myPlayer && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <PlayerHand
            player={myPlayer}
            isCurrentTurn={gameState.currentTurn === playerId}
            isDealer={myPlayer.isDealer}
            position="bottom"
            isLocalPlayer
          />
        </div>
      )}

      {/* Game Info Overlay */}
      <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm rounded-lg p-4 text-white">
        <div className="text-sm space-y-1">
          <div>Round: {gameState.round}</div>
          <div>Small Blind: ${gameState.smallBlind}</div>
          <div>Big Blind: ${gameState.bigBlind}</div>
          <div>Players: {players.length}</div>
        </div>
      </div>

      {/* Winner Announcement */}
      {gameState.winner && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black rounded-2xl p-8 text-center max-w-md mx-4">
            <div className="text-4xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold mb-2">Winner!</h2>
            <div className="text-xl mb-2">{gameState.winner.playerName}</div>
            <div className="text-lg mb-2">{gameState.winner.hand}</div>
            <div className="text-2xl font-bold">
              ${gameState.winner.winAmount.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};