// /client/src/components/poker/components/GameInfo.tsx - Fixed null checks
import React from 'react';
import { usePokerGame } from '../context/PokerGameContext';

export const GameInfo: React.FC = () => {
  const { gameState } = usePokerGame();

  if (!gameState) return null;

  // Safely get players array with null checks
  const players = gameState.players || [];
  const activePlayers = players.filter(p => p && p.connected && !p.folded);

  return (
    <div className="bg-black/50 backdrop-blur-sm p-4 border-b border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Game Rules */}
          <div>
            <h3 className="text-lg font-bold mb-3 text-blue-400">Game Rules</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div>• Each player gets 2 hole cards</div>
              <div>• 5 community cards are dealt</div>
              <div>• Make the best 5-card hand</div>
              <div>• Betting rounds: Pre-flop, Flop, Turn, River</div>
              <div>• Win with the best hand or by making others fold</div>
            </div>
          </div>

          {/* Hand Rankings */}
          <div>
            <h3 className="text-lg font-bold mb-3 text-green-400">Hand Rankings</h3>
            <div className="space-y-1 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Royal Flush</span>
                <span className="text-yellow-400">Highest</span>
              </div>
              <div className="flex justify-between">
                <span>Straight Flush</span>
                <span>2nd</span>
              </div>
              <div className="flex justify-between">
                <span>Four of a Kind</span>
                <span>3rd</span>
              </div>
              <div className="flex justify-between">
                <span>Full House</span>
                <span>4th</span>
              </div>
              <div className="flex justify-between">
                <span>Flush</span>
                <span>5th</span>
              </div>
              <div className="flex justify-between">
                <span>Straight</span>
                <span>6th</span>
              </div>
              <div className="flex justify-between">
                <span>Three of a Kind</span>
                <span>7th</span>
              </div>
              <div className="flex justify-between">
                <span>Two Pair</span>
                <span>8th</span>
              </div>
              <div className="flex justify-between">
                <span>One Pair</span>
                <span>9th</span>
              </div>
              <div className="flex justify-between">
                <span>High Card</span>
                <span className="text-gray-500">Lowest</span>
              </div>
            </div>
          </div>

          {/* Current Game Status */}
          <div>
            <h3 className="text-lg font-bold mb-3 text-purple-400">Game Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Phase:</span>
                <span className="text-white capitalize">{gameState.gamePhase.replace('-', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Round:</span>
                <span className="text-white">{gameState.round}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Players:</span>
                <span className="text-white">{players.length} total, {activePlayers.length} active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Small Blind:</span>
                <span className="text-green-400">${gameState.smallBlind}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Big Blind:</span>
                <span className="text-green-400">${gameState.bigBlind}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Current Pot:</span>
                <span className="text-yellow-400">${gameState.pot.toLocaleString()}</span>
              </div>
              {gameState.currentBet > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Current Bet:</span>
                  <span className="text-blue-400">${gameState.currentBet}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Players Summary */}
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-3 text-orange-400">Players</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {players.map((player, index) => {
              // Safety check for player object
              if (!player || !player.id) {
                return (
                  <div key={`empty-${index}`} className="bg-black/30 rounded-lg p-3 border border-gray-600">
                    <div className="text-gray-500">Empty Seat</div>
                  </div>
                );
              }

              return (
                <div 
                  key={player.id}
                  className={`bg-black/30 rounded-lg p-3 border ${
                    gameState.currentTurn === player.id 
                      ? 'border-yellow-400' 
                      : player.connected 
                        ? 'border-gray-600' 
                        : 'border-red-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium ${
                      gameState.currentTurn === player.id ? 'text-yellow-400' : 'text-white'
                    }`}>
                      {player.name || 'Unknown Player'}
                    </span>
                    <div className="flex gap-1">
                      {player.isDealer && (
                        <span className="w-4 h-4 bg-white text-black rounded-full text-xs flex items-center justify-center font-bold">
                          D
                        </span>
                      )}
                      {player.folded && (
                        <span className="px-1 py-0.5 bg-red-600 text-white text-xs rounded">F</span>
                      )}
                      {player.allIn && (
                        <span className="px-1 py-0.5 bg-purple-600 text-white text-xs rounded">AI</span>
                      )}
                      {!player.connected && (
                        <span className="px-1 py-0.5 bg-gray-600 text-white text-xs rounded">DC</span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-green-400 font-bold">
                    ${(player.chips || 0).toLocaleString()}
                  </div>
                  {player.currentBet > 0 && (
                    <div className="text-xs text-blue-300">
                      Bet: ${player.currentBet}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};