// client/src/components/poker/components/Lobby.tsx

import React, { useState } from 'react';
import { ConnectionState } from '../types';

interface LobbyProps {
  connectionState: ConnectionState;
  onConnect: (playerName: string) => void;
  onDisconnect: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  connectionState,
  onConnect,
  onDisconnect,
}) => {
  const [playerName, setPlayerName] = useState('');

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onConnect(playerName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🃏</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Texas Hold'em Poker</h1>
          <p className="text-gray-600">Join a poker room and play with up to 4 players</p>
        </div>

        {!connectionState.isConnected ? (
          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={connectionState.isConnecting}
                maxLength={20}
              />
            </div>

            <button
              type="submit"
              disabled={connectionState.isConnecting || !playerName.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              {connectionState.isConnecting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Connecting...
                </div>
              ) : (
                'Join Poker Room'
              )}
            </button>

            {connectionState.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {connectionState.error}
              </div>
            )}
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Connected to room!
            </div>
            
            <div className="text-sm text-gray-600">
              Room ID: {connectionState.roomId}
            </div>
            
            <button
              onClick={onDisconnect}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Leave Room
            </button>
          </div>
        )}

        <div className="mt-8 text-xs text-gray-500 text-center">
          <div className="mb-2">Game Rules:</div>
          <ul className="text-left space-y-1">
            <li>• 2-4 players maximum</li>
            <li>• Starting chips: $1000</li>
            <li>• Small blind: $10, Big blind: $20</li>
            <li>• Game starts automatically with 2+ players</li>
          </ul>
        </div>
      </div>
    </div>
  );
};