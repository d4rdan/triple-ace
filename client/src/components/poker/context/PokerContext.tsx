// client/src/components/poker/context/PokerContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as Colyseus from 'colyseus.js';
import { PokerGameState, ConnectionState, PlayerAction } from '../types';

interface PokerContextType {
  gameState: PokerGameState | null;
  connectionState: ConnectionState;
  connectToRoom: (playerName: string) => Promise<void>;
  disconnectFromRoom: () => void;
  sendAction: (action: PlayerAction) => void;
  startGame: () => void;
}

const initialConnectionState: ConnectionState = {
  isConnecting: false,
  isConnected: false,
  error: null,
};

const PokerContext = createContext<PokerContextType | null>(null);

export const PokerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<PokerGameState | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>(initialConnectionState);
  const [client, setClient] = useState<Colyseus.Client | null>(null);
  const [room, setRoom] = useState<Colyseus.Room | null>(null);

  // Initialize Colyseus client
  useEffect(() => {
    const colyseusClient = new Colyseus.Client('ws://localhost:3001');
    setClient(colyseusClient);

    return () => {
      // Cleanup - disconnect any active rooms but don't call close() on client
      if (room) {
        room.leave();
      }
    };
  }, [room]);

  const connectToRoom = useCallback(async (playerName: string) => {
    if (!client || connectionState.isConnecting) return;

    try {
      setConnectionState(prev => ({ ...prev, isConnecting: true, error: null }));

      console.log('Connecting to poker room...');
      const pokerRoom = await client.joinOrCreate('poker', { name: playerName });
      
      setRoom(pokerRoom);
      setConnectionState({
        isConnecting: false,
        isConnected: true,
        error: null,
        roomId: pokerRoom.id,
        playerId: pokerRoom.sessionId,
      });

      console.log('Connected to poker room:', pokerRoom.id);

      // Listen for state changes
      pokerRoom.onStateChange((state) => {
        console.log('Game state updated:', state);
        setGameState({
          players: state.players.toJSON(),
          communityCards: state.communityCards.toArray(),
          pot: state.pot,
          currentBet: state.currentBet,
          currentPlayer: state.currentPlayer,
          phase: state.phase,
          dealerPosition: state.dealerPosition,
          smallBlind: state.smallBlind,
          bigBlind: state.bigBlind,
          message: state.message,
          gameStarted: state.gameStarted,
          roundNumber: state.roundNumber,
        });
      });

      // Listen for errors
      pokerRoom.onError((code, message) => {
        console.error('Room error:', code, message);
        setConnectionState(prev => ({ ...prev, error: `Room error: ${message}` }));
      });

      // Listen for room leave
      pokerRoom.onLeave((code) => {
        console.log('Left room with code:', code);
        setConnectionState(initialConnectionState);
        setGameState(null);
        setRoom(null);
      });

    } catch (error) {
      console.error('Failed to connect to poker room:', error);
      setConnectionState({
        isConnecting: false,
        isConnected: false,
        error: error instanceof Error ? error.message : 'Failed to connect',
      });
    }
  }, [client, connectionState.isConnecting]);

  const disconnectFromRoom = useCallback(() => {
    if (room) {
      room.leave();
      setRoom(null);
    }
    setConnectionState(initialConnectionState);
    setGameState(null);
  }, [room]);

  const sendAction = useCallback((action: PlayerAction) => {
    if (room && connectionState.isConnected) {
      console.log('Sending action:', action);
      room.send('player-action', action);
    }
  }, [room, connectionState.isConnected]);

  const startGame = useCallback(() => {
    if (room && connectionState.isConnected) {
      console.log('Starting game...');
      room.send('start-game');
    }
  }, [room, connectionState.isConnected]);

  const value: PokerContextType = {
    gameState,
    connectionState,
    connectToRoom,
    disconnectFromRoom,
    sendAction,
    startGame,
  };

  return <PokerContext.Provider value={value}>{children}</PokerContext.Provider>;
};

export const usePoker = (): PokerContextType => {
  const context = useContext(PokerContext);
  if (!context) {
    throw new Error('usePoker must be used within a PokerProvider');
  }
  return context;
};