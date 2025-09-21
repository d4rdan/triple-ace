// client/src/components/poker/PokerGame.tsx

'use client';

import React from 'react';
import { PokerProvider, usePoker } from './context/PokerContext';
import { Lobby } from './components/Lobby';
import { GameTable } from './components/GameTable';

const PokerGameContent: React.FC = () => {
  const {
    gameState,
    connectionState,
    connectToRoom,
    disconnectFromRoom,
    sendAction,
    startGame,
  } = usePoker();

  // Show lobby if not connected or no game state
  if (!connectionState.isConnected || !gameState) {
    return (
      <Lobby
        connectionState={connectionState}
        onConnect={connectToRoom}
        onDisconnect={disconnectFromRoom}
      />
    );
  }

  // Show waiting screen if game hasn't started
  if (!gameState.gameStarted) {
    const playerCount = Object.keys(gameState.players).length;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-900 to-green-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Waiting for Game to Start</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-100 text-blue-800 px-4 py-3 rounded">
              {gameState.message}
            </div>
            
            <div className="text-gray-600">
              Players in room: {playerCount}/4
            </div>
            
            {/* Show connected players */}
            <div className="bg-gray-100 p-4 rounded">
              <div className="text-sm font-medium text-gray-700 mb-2">Players:</div>
              <div className="space-y-1">
                {Object.values(gameState.players).map((player) => (
                  <div key={player.id} className="flex justify-between text-sm">
                    <span>{player.name}</span>
                    <span className="text-gray-500">${player.chips}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {playerCount >= 2 && (
              <button
                onClick={startGame}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Start Game Now
              </button>
            )}
            
            <button
              onClick={disconnectFromRoom}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Leave Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show main game table
  return (
    <div className="relative">
      {/* Disconnect button */}
      <button
        onClick={disconnectFromRoom}
        className="fixed top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
      >
        Leave Game
      </button>
      
      <GameTable
        gameState={gameState}
        localPlayerId={connectionState.playerId!}
        onAction={sendAction}
      />
    </div>
  );
};

const PokerGame: React.FC = () => {
  return (
    <PokerProvider>
      <PokerGameContent />
    </PokerProvider>
  );
};

export default PokerGame;