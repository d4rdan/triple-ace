// client/components/lobby/GameSelection.tsx
import React, { useState } from 'react';
import { Player } from '../../types';

interface GameSelectionProps {
  player: Player;
  onJoinRoulette: (roomCode?: string) => void;
  onJoinPoker: (roomCode?: string) => void;
}

const GameSelection: React.FC<GameSelectionProps> = ({ 
  player, 
  onJoinRoulette, 
  onJoinPoker 
}) => {
  const [roomCode, setRoomCode] = useState('');

  return (
    <div className="space-y-6">
      {/* Player Info */}
      <div className="text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome, {player.username}!</h2>
        <div className="text-yellow-400 text-xl font-bold">
          💰 {player.chips} Chips
        </div>
      </div>

      {/* Room Code Input */}
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Room Code (optional)
        </label>
        <input
          type="text"
          placeholder="Enter room code to join existing game"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 
                   focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          maxLength={6}
        />
      </div>

      {/* Game Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => onJoinRoulette(roomCode || undefined)}
          className="w-full p-4 bg-red-600 text-white font-bold text-lg rounded-lg 
                   hover:bg-red-700 transition-colors duration-200 
                   flex items-center justify-center space-x-2"
        >
          <span className="text-2xl">🎡</span>
          <span>Join Roulette</span>
        </button>
        
        <button
          onClick={() => onJoinPoker(roomCode || undefined)}
          className="w-full p-4 bg-green-600 text-white font-bold text-lg rounded-lg 
                   hover:bg-green-700 transition-colors duration-200 
                   flex items-center justify-center space-x-2"
        >
          <span className="text-2xl">🃏</span>
          <span>Join Poker</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="text-gray-400 text-sm text-center">
        <p>Leave room code empty to create a new game,</p>
        <p>or enter a code to join an existing room.</p>
      </div>
    </div>
  );
};

export default GameSelection;