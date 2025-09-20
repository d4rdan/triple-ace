// client/hooks/usePlayer.ts
import { useState, useEffect } from 'react';
import { Player } from '../types';
import { Socket } from 'socket.io-client';

export const usePlayer = (socket: Socket | null) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handlePlayerJoined = (playerData: Player) => {
      setPlayer(playerData);
      setIsJoining(false);
    };

    socket.on('player-joined', handlePlayerJoined);

    return () => {
      socket.off('player-joined', handlePlayerJoined);
    };
  }, [socket]);

  const joinServer = (username: string) => {
    if (socket && username.trim() && !isJoining) {
      setIsJoining(true);
      socket.emit('join-server', username.trim());
    }
  };

  return { player, joinServer, isJoining };
};