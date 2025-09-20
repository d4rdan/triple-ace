// client/components/lobby/GameLobby.tsx
import React from 'react';
import { useSocket } from '../../hooks/useSocket';
import { usePlayer } from '../../hooks/usePlayer';
import UsernameForm from './UsernameForm';
import GameSelection from './GameSelection';
import ConnectionStatus from '../ui/ConnectionStatus';
import { useRouter } from 'next/router';

const GameLobby: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const { player, joinServer, isJoining } = usePlayer(socket);
  const router = useRouter();

  const handleJoinRoulette = (roomCode?: string) => {
    if (socket) {
      socket.emit('join-roulette', roomCode);
      router.push('/roulette');
    }
  };

  const handleJoinPoker = (roomCode?: string) => {
    if (socket) {
      socket.emit('join-poker', roomCode);
      router.push('/poker');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎰 Casino
          </h1>
          <p className="text-gray-400">Multiplayer Gaming Platform</p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {!player ? (
            <UsernameForm
              onSubmit={joinServer}
              isLoading={isJoining}
              isConnected={isConnected}
            />
          ) : (
            <GameSelection
              player={player}
              onJoinRoulette={handleJoinRoulette}
              onJoinPoker={handleJoinPoker}
            />
          )}
        </div>

        {/* Connection Status */}
        <ConnectionStatus isConnected={isConnected} />
      </div>
    </div>
  );
};

export default GameLobby;
