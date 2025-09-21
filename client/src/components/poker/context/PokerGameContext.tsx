// /client/src/components/poker/context/PokerGameContext.tsx - Real connection
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePokerSocket } from '../hooks/usePokerSocket';
import { usePlatform } from '../../platform/PlatformProvider';

export interface Card {
  id: string;
  suit: '♠' | '♥' | '♦' | '♣';
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
  value: number;
}

export interface PokerPlayer {
  id: string;
  name: string;
  chips: number;
  cards: Card[];
  currentBet: number;
  folded: boolean;
  allIn: boolean;
  connected: boolean;
  position: number;
  isDealer: boolean;
  hasActed: boolean;
  showCards: boolean;
}

export interface PokerGameState {
  gamePhase: 'waiting' | 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown' | 'finished';
  players: PokerPlayer[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  currentTurn: string;
  dealerPosition: number;
  smallBlind: number;
  bigBlind: number;
  round: number;
  winner?: {
    playerId: string;
    playerName: string;
    hand: string;
    winAmount: number;
  };
}

interface PokerGameContextType {
  // Game state
  gameState: PokerGameState | null;
  playerId: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  
  // Game info
  isMyTurn: boolean;
  myPlayer: PokerPlayer | null;
  canCheck: boolean;
  canCall: boolean;
  canRaise: boolean;
  callAmount: number;
  minRaise: number;
  maxRaise: number;
  
  // Actions
  joinRoom: (playerName: string, roomCode?: string) => Promise<void>;
  leaveRoom: () => void;
  fold: () => void;
  check: () => void;
  call: () => void;
  raise: (amount: number) => void;
  allIn: () => void;
}

const PokerGameContext = createContext<PokerGameContextType | null>(null);

export const usePokerGame = () => {
  const context = useContext(PokerGameContext);
  if (!context) {
    throw new Error('usePokerGame must be used within PokerGameProvider');
  }
  return context;
};

interface PokerGameProviderProps {
  children: React.ReactNode;
}

export const PokerGameProvider: React.FC<PokerGameProviderProps> = ({ children }) => {
  const { playerName, soundEnabled } = usePlatform();
  const [gameState, setGameState] = useState<PokerGameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  const {
    isConnecting,
    isConnected,
    error,
    connect,
    disconnect,
    sendMessage
  } = usePokerSocket({
    onStateChange: (newState) => {
      console.log('[PokerGameContext] State updated:', newState);
      setGameState(newState);
    },
    onPlayerJoin: (player) => {
      if (player?.name) {
        console.log(`[PokerGameContext] Player joined: ${player.name}`);
        if (soundEnabled) {
          playSound('playerJoin');
        }
      }
    },
    onPlayerLeave: (player) => {
      if (player?.name) {
        console.log(`[PokerGameContext] Player left: ${player.name}`);
        if (soundEnabled) {
          playSound('playerLeave');
        }
      }
    },
    onGameStart: () => {
      console.log('[PokerGameContext] Game started');
      if (soundEnabled) {
        playSound('gameStart');
      }
    },
    onGameEnd: (winner) => {
      console.log('[PokerGameContext] Game ended, winner:', winner);
      if (soundEnabled) {
        playSound(winner?.playerId === playerId ? 'win' : 'lose');
      }
    },
    onError: (error) => {
      console.error('[PokerGameContext] Error:', error);
    }
  });

  // Get current player data with null checks
  const myPlayer = gameState?.players?.find(p => p?.id === playerId) || null;
  const isMyTurn = gameState?.currentTurn === playerId && myPlayer !== null;

  // Calculate betting options with null checks
  const callAmount = myPlayer ? Math.max(0, (gameState?.currentBet || 0) - myPlayer.currentBet) : 0;
  const canCheck = callAmount === 0 && myPlayer !== null;
  const canCall = callAmount > 0 && myPlayer ? myPlayer.chips >= callAmount : false;
  const canRaise = myPlayer ? myPlayer.chips > callAmount : false;
  const minRaise = (gameState?.currentBet || 0) + (gameState?.bigBlind || 20);
  const maxRaise = myPlayer ? myPlayer.chips : 0;

  // Join a poker room
  const joinRoom = useCallback(async (playerName: string, roomCode?: string) => {
    if (!playerName?.trim()) {
      throw new Error('Player name is required');
    }
    
    try {
      console.log('[PokerGameContext] Joining room with player name:', playerName);
      const sessionId = await connect(playerName, roomCode);
      setPlayerId(sessionId);
      console.log('[PokerGameContext] Successfully joined, session ID:', sessionId);
    } catch (error) {
      console.error('[PokerGameContext] Failed to join room:', error);
      throw error;
    }
  }, [connect]);

  // Leave the room
  const leaveRoom = useCallback(() => {
    console.log('[PokerGameContext] Leaving room');
    disconnect();
    setGameState(null);
    setPlayerId(null);
  }, [disconnect]);

  // Game actions with null checks
  const fold = useCallback(() => {
    if (!isMyTurn || !myPlayer) {
      console.warn('[PokerGameContext] Cannot fold - not my turn or no player');
      return;
    }
    console.log('[PokerGameContext] Folding');
    sendMessage('fold');
    if (soundEnabled) playSound('fold');
  }, [isMyTurn, myPlayer, sendMessage, soundEnabled]);

  const check = useCallback(() => {
    if (!isMyTurn || !canCheck || !myPlayer) {
      console.warn('[PokerGameContext] Cannot check - not my turn, cannot check, or no player');
      return;
    }
    console.log('[PokerGameContext] Checking');
    sendMessage('check');
    if (soundEnabled) playSound('check');
  }, [isMyTurn, canCheck, myPlayer, sendMessage, soundEnabled]);

  const call = useCallback(() => {
    if (!isMyTurn || !canCall || !myPlayer) {
      console.warn('[PokerGameContext] Cannot call - not my turn, cannot call, or no player');
      return;
    }
    console.log('[PokerGameContext] Calling', callAmount);
    sendMessage('call', { amount: callAmount });
    if (soundEnabled) playSound('call');
  }, [isMyTurn, canCall, myPlayer, callAmount, sendMessage, soundEnabled]);

  const raise = useCallback((amount: number) => {
    if (!isMyTurn || !canRaise || !myPlayer || amount < minRaise || amount > maxRaise) {
      console.warn('[PokerGameContext] Cannot raise - invalid conditions');
      return;
    }
    console.log('[PokerGameContext] Raising to', amount);
    sendMessage('raise', { amount });
    if (soundEnabled) playSound('raise');
  }, [isMyTurn, canRaise, myPlayer, minRaise, maxRaise, sendMessage, soundEnabled]);

  const allIn = useCallback(() => {
    if (!isMyTurn || !myPlayer || myPlayer.chips <= 0) {
      console.warn('[PokerGameContext] Cannot go all-in - invalid conditions');
      return;
    }
    console.log('[PokerGameContext] Going all-in');
    sendMessage('allIn');
    if (soundEnabled) playSound('allIn');
  }, [isMyTurn, myPlayer, sendMessage, soundEnabled]);

  // Simple sound effects with error handling
  const playSound = (type: string) => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      let frequency = 440;
      let duration = 0.2;

      switch (type) {
        case 'playerJoin':
          frequency = 600;
          duration = 0.3;
          break;
        case 'playerLeave':
          frequency = 400;
          duration = 0.3;
          break;
        case 'gameStart':
          frequency = 800;
          duration = 0.5;
          break;
        case 'fold':
          frequency = 300;
          duration = 0.2;
          break;
        case 'check':
          frequency = 500;
          duration = 0.1;
          break;
        case 'call':
          frequency = 600;
          duration = 0.2;
          break;
        case 'raise':
          frequency = 800;
          duration = 0.3;
          break;
        case 'allIn':
          frequency = 1000;
          duration = 0.4;
          break;
        case 'win':
          frequency = 1200;
          duration = 0.6;
          break;
        case 'lose':
          frequency = 250;
          duration = 0.4;
          break;
      }

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  };

  const value: PokerGameContextType = {
    gameState,
    playerId,
    isConnecting,
    isConnected,
    error,
    isMyTurn,
    myPlayer,
    canCheck,
    canCall,
    canRaise,
    callAmount,
    minRaise,
    maxRaise,
    joinRoom,
    leaveRoom,
    fold,
    check,
    call,
    raise,
    allIn
  };

  return (
    <PokerGameContext.Provider value={value}>
      {children}
    </PokerGameContext.Provider>
  );
};