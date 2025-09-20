// client/hooks/useSocket.ts
import { useEffect, useState } from 'react';
import { socketManager } from '../lib/socket';
import { Socket } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = socketManager.connect();
    setSocket(newSocket);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    newSocket.on('connect', handleConnect);
    newSocket.on('disconnect', handleDisconnect);

    // Set initial connection state
    setIsConnected(newSocket.connected);

    return () => {
      newSocket.off('connect', handleConnect);
      newSocket.off('disconnect', handleDisconnect);
    };
  }, []);

  return { socket, isConnected };
};
