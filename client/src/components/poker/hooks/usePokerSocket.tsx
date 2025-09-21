// /client/src/components/poker/hooks/usePokerSocket.tsx - Fixed data conversion
import { useState, useCallback, useRef, useEffect } from 'react';
import { Client, Room } from 'colyseus.js';
import { PokerGameState, PokerPlayer } from '../context/PokerGameContext';

interface PokerSocketCallbacks {
  onStateChange?: (state: PokerGameState) => void;
  onPlayerJoin?: (player: PokerPlayer) => void;
  onPlayerLeave?: (player: PokerPlayer) => void;
  onGameStart?: () => void;
  onGameEnd?: (winner?: { playerId: string; playerName: string; hand: string; winAmount: number }) => void;
  onError?: (error: string) => void;
}

export const usePokerSocket = (callbacks: PokerSocketCallbacks) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const clientRef = useRef<Client | null>(null);
  const roomRef = useRef<Room | null>(null);
  const playerNameRef = useRef<string>('');

  // Initialize client
  useEffect(() => {
    const serverUrl = process.env.NEXT_PUBLIC_POKER_SERVER_URL || 'ws://localhost:2567';
    clientRef.current = new Client(serverUrl);
    console.log('[PokerSocket] Initialized client for:', serverUrl);
    
    return () => {
      if (roomRef.current) {
        roomRef.current.leave();
      }
    };
  }, []);

  // Convert server data structures to client format
  const convertServerState = (serverState: any): PokerGameState => {
    console.log('[PokerSocket] Converting server state:', serverState);
    
    // Convert players Map to Array
    let players: PokerPlayer[] = [];
    if (serverState.players) {
      if (serverState.players instanceof Map) {
        players = Array.from(serverState.players.values());
      } else if (typeof serverState.players === 'object') {
        // Handle Colyseus MapSchema
        players = Object.values(serverState.players);
      } else if (Array.isArray(serverState.players)) {
        players = serverState.players;
      }
    }

    // Convert community cards
    let communityCards = [];
    if (serverState.communityCards) {
      if (Array.isArray(serverState.communityCards)) {
        communityCards = serverState.communityCards;
      } else if (serverState.communityCards instanceof Map) {
        communityCards = Array.from(serverState.communityCards.values());
      } else {
        communityCards = Object.values(serverState.communityCards);
      }
    }

    const gameState: PokerGameState = {
      gamePhase: serverState.gamePhase || 'waiting',
      players: players,
      communityCards: communityCards,
      pot: serverState.pot || 0,
      currentBet: serverState.currentBet || 0,
      currentTurn: serverState.currentTurn || '',
      dealerPosition: serverState.dealerPosition || 0,
      smallBlind: serverState.smallBlind || 10,
      bigBlind: serverState.bigBlind || 20,
      round: serverState.round || 1,
      winner: serverState.winner
    };

    console.log('[PokerSocket] Converted game state:', gameState);
    console.log('[PokerSocket] Players count:', players.length);
    
    return gameState;
  };

  // Setup room listeners
  const setupRoomListeners = useCallback((room: Room) => {
    console.log('[PokerSocket] Setting up room listeners for room:', room.id);

    room.onStateChange((state) => {
      console.log('[PokerSocket] Raw state from server:', state);
      const convertedState = convertServerState(state);
      callbacks.onStateChange?.(convertedState);
    });

    // Listen for player events
    room.onMessage('playerJoined', (data) => {
      console.log('[PokerSocket] Player joined message:', data);
      callbacks.onPlayerJoin?.(data.player);
    });

    room.onMessage('playerLeft', (data) => {
      console.log('[PokerSocket] Player left message:', data);
      callbacks.onPlayerLeave?.(data.player);
    });

    room.onMessage('gameStarted', (data) => {
      console.log('[PokerSocket] Game started message:', data);
      callbacks.onGameStart?.();
    });

    room.onMessage('gameEnded', (data) => {
      console.log('[PokerSocket] Game ended message:', data);
      callbacks.onGameEnd?.(data.winner);
    });

    // Error handling
    room.onMessage('error', (data) => {
      console.error('[PokerSocket] Server error message:', data);
      callbacks.onError?.(data.message || 'Server error');
      setError(data.message || 'Server error');
    });

    room.onError((code, message) => {
      console.error('[PokerSocket] Room error:', code, message);
      callbacks.onError?.(message || `Room error: ${code}`);
      setError(message || `Room error: ${code}`);
      setIsConnected(false);
    });

    room.onLeave((code) => {
      console.log('[PokerSocket] Left room with code:', code);
      setIsConnected(false);
      roomRef.current = null;
    });

    // Listen for state changes on specific properties
    room.state.players?.onAdd = (player: any, key: string) => {
      console.log('[PokerSocket] Player added:', key, player);
    };

    room.state.players?.onRemove = (player: any, key: string) => {
      console.log('[PokerSocket] Player removed:', key, player);
    };

  }, [callbacks]);

  // Connect to a poker room
  const connect = useCallback(async (playerName: string, roomCode?: string): Promise<string> => {
    if (!clientRef.current) {
      throw new Error('Client not initialized');
    }

    if (!playerName?.trim()) {
      throw new Error('Player name is required');
    }

    setIsConnecting(true);
    setError(null);
    playerNameRef.current = playerName;

    try {
      console.log('[PokerSocket] Attempting to connect with player name:', playerName);
      
      let room: Room;
      
      if (roomCode?.trim()) {
        // Join specific room
        console.log('[PokerSocket] Joining room by ID:', roomCode);
        room = await clientRef.current.joinById(roomCode, { playerName });
      } else {
        // Join or create a room
        console.log('[PokerSocket] Attempting to join or create poker_room');
        try {
          room = await clientRef.current.joinOrCreate('poker_room', { playerName });
        } catch (joinError) {
          console.log('[PokerSocket] Join/create failed, error:', joinError);
          throw joinError;
        }
      }

      roomRef.current = room;
      setupRoomListeners(room);
      setIsConnected(true);
      setIsConnecting(false);

      console.log('[PokerSocket] Successfully connected to room:', room.id);
      console.log('[PokerSocket] Session ID:', room.sessionId);
      console.log('[PokerSocket] Room state:', room.state);
      
      return room.sessionId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to poker server';
      console.error('[PokerSocket] Connection failed:', error);
      setError(errorMessage);
      setIsConnecting(false);
      callbacks.onError?.(errorMessage);
      throw new Error(errorMessage);
    }
  }, [setupRoomListeners, callbacks]);

  // Disconnect from room
  const disconnect = useCallback(() => {
    if (roomRef.current) {
      console.log('[PokerSocket] Disconnecting from room');
      roomRef.current.leave();
      roomRef.current = null;
    }
    setIsConnected(false);
    setError(null);
  }, []);

  // Send message to server
  const sendMessage = useCallback((type: string, data?: any) => {
    if (!roomRef.current) {
      console.warn('[PokerSocket] Cannot send message: not connected');
      return;
    }

    try {
      console.log(`[PokerSocket] Sending message: ${type}`, data);
      roomRef.current.send(type, data);
    } catch (error) {
      console.error('[PokerSocket] Failed to send message:', error);
      callbacks.onError?.('Failed to send message');
    }
  }, [callbacks]);

  // Reconnection logic
  const reconnect = useCallback(async () => {
    if (playerNameRef.current) {
      try {
        console.log('[PokerSocket] Attempting to reconnect...');
        await connect(playerNameRef.current);
      } catch (error) {
        console.error('[PokerSocket] Reconnection failed:', error);
      }
    }
  }, [connect]);

  return {
    isConnecting,
    isConnected,
    error,
    connect,
    disconnect,
    sendMessage,
    reconnect
  };
};