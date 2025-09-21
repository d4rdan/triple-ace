// src/context/GameContext.tsx

'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { GameState, GamePhase, Bet, BetType, ChipValue } from '../types';
import { generateBetId, generateWinningNumber, calculateTotalWins } from '../utils/gameLogic';
import { localStorageService } from '../services/localStorageService';

// Initial state
const initialState: GameState = {
  phase: 'BETTING',
  playerCoins: 0,
  selectedChip: null,
  activeBets: [],
  lastBets: [],
  winningNumber: null,
  totalBet: 0,
  lastWin: 0,
  spinHistory: []
};

// Actions
type GameAction =
  | { type: 'SET_PHASE'; payload: GamePhase }
  | { type: 'SET_PLAYER_COINS'; payload: number }
  | { type: 'SET_SELECTED_CHIP'; payload: ChipValue | null }
  | { type: 'ADD_BET'; payload: Bet }
  | { type: 'CLEAR_BETS' }
  | { type: 'SET_WINNING_NUMBER'; payload: number }
  | { type: 'SET_LAST_WIN'; payload: number }
  | { type: 'SET_LAST_BETS'; payload: Bet[] }
  | { type: 'SET_SPIN_HISTORY'; payload: number[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'NEXT_ROUND' };

// Extended state with loading and error
interface ExtendedGameState extends GameState {
  isLoadingBalance: boolean;
  error: string | null;
}

const extendedInitialState: ExtendedGameState = {
  ...initialState,
  isLoadingBalance: false,
  error: null
};

// Reducer
const gameReducer = (state: ExtendedGameState, action: GameAction): ExtendedGameState => {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.payload };
    
    case 'SET_PLAYER_COINS':
      return { ...state, playerCoins: action.payload };
    
    case 'SET_SELECTED_CHIP':
      return { ...state, selectedChip: action.payload };
    
    case 'ADD_BET':
      const newBet = action.payload;
      const updatedBets = [...state.activeBets, newBet];
      const newTotalBet = updatedBets.reduce((sum, bet) => sum + bet.amount, 0);
      return {
        ...state,
        activeBets: updatedBets,
        totalBet: newTotalBet
      };
    
    case 'CLEAR_BETS':
      return {
        ...state,
        activeBets: [],
        totalBet: 0,
        selectedChip: null
      };
    
    case 'SET_WINNING_NUMBER':
      return { ...state, winningNumber: action.payload };
    
    case 'SET_LAST_WIN':
      return { ...state, lastWin: action.payload };
    
    case 'SET_LAST_BETS':
      return { ...state, lastBets: action.payload };
    
    case 'SET_SPIN_HISTORY':
      return { ...state, spinHistory: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoadingBalance: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'NEXT_ROUND':
      return {
        ...state,
        phase: 'BETTING',
        activeBets: [],
        totalBet: 0,
        winningNumber: null,
        lastWin: 0,
        selectedChip: null,
        error: null
      };
    
    default:
      return state;
  }
};

// Context type
interface GameContextType extends ExtendedGameState {
  selectChip: (chip: ChipValue | null) => void;
  placeBet: (position: string | number, type: BetType, numbers: number[]) => void;
  clearAllBets: () => void;
  repeatLastBets: () => void;
  spin: () => Promise<void>;
  nextRound: () => void;
  refreshBalance: () => void;
  clearError: () => void;
}

// Create context
const GameContext = createContext<GameContextType | null>(null);

// Provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, extendedInitialState);

  // Initialize game data from localStorage
  const initializeGame = useCallback(() => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Get balance from localStorage
      const balance = localStorageService.getBalance();
      dispatch({ type: 'SET_PLAYER_COINS', payload: balance });
      
      // Get spin history from localStorage
      const history = localStorageService.getGameHistory();
      dispatch({ type: 'SET_SPIN_HISTORY', payload: history });
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Error initializing game:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load game data' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Select chip
  const selectChip = useCallback((chip: ChipValue | null) => {
    if (state.phase === 'BETTING' && !state.isLoadingBalance) {
      dispatch({ type: 'SET_SELECTED_CHIP', payload: chip });
    }
  }, [state.phase, state.isLoadingBalance]);

  // Place bet
  const placeBet = useCallback((position: string | number, type: BetType, numbers: number[]) => {
    if (state.phase !== 'BETTING' || !state.selectedChip || state.isLoadingBalance) {
      return;
    }

    const betAmount = state.selectedChip;
    
    // Check if player has enough balance for this bet
    if (state.totalBet + betAmount > state.playerCoins) {
      dispatch({ type: 'SET_ERROR', payload: 'Insufficient balance for this bet' });
      return;
    }

    // Create new bet
    const newBet: Bet = {
      id: generateBetId(),
      position,
      amount: betAmount,
      type,
      numbers
    };

    dispatch({ type: 'ADD_BET', payload: newBet });
    dispatch({ type: 'SET_ERROR', payload: null });
  }, [state.phase, state.selectedChip, state.totalBet, state.playerCoins, state.isLoadingBalance]);

  // Clear all bets
  const clearAllBets = useCallback(() => {
    if (state.phase === 'BETTING' && !state.isLoadingBalance) {
      dispatch({ type: 'CLEAR_BETS' });
      dispatch({ type: 'SET_ERROR', payload: null });
    }
  }, [state.phase, state.isLoadingBalance]);

  // Repeat last bets
  const repeatLastBets = useCallback(() => {
    if (state.phase !== 'BETTING' || state.lastBets.length === 0 || state.isLoadingBalance) {
      return;
    }

    const totalLastBetAmount = state.lastBets.reduce((sum, bet) => sum + bet.amount, 0);
    
    // Check if player has enough balance
    if (totalLastBetAmount > state.playerCoins) {
      dispatch({ type: 'SET_ERROR', payload: 'Insufficient balance to repeat last bets' });
      return;
    }

    // Clear current bets and add last bets with new IDs
    dispatch({ type: 'CLEAR_BETS' });
    
    state.lastBets.forEach(bet => {
      const newBet: Bet = {
        ...bet,
        id: generateBetId()
      };
      dispatch({ type: 'ADD_BET', payload: newBet });
    });

    dispatch({ type: 'SET_ERROR', payload: null });
  }, [state.phase, state.lastBets, state.playerCoins, state.isLoadingBalance]);

  // Spin the wheel
  const spin = useCallback(async () => {
    if (state.phase !== 'BETTING' || state.totalBet === 0 || state.isLoadingBalance) {
      return;
    }

    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // First, deduct the bet amount from balance
      const deductResult = localStorageService.subtractFromBalance(state.totalBet);
      if (!deductResult.success) {
        dispatch({ type: 'SET_ERROR', payload: deductResult.error || 'Failed to place bet' });
        return;
      }

      // Update balance in state
      dispatch({ type: 'SET_PLAYER_COINS', payload: deductResult.newBalance });

      // Save current bets as last bets
      dispatch({ type: 'SET_LAST_BETS', payload: [...state.activeBets] });

      // Set phase to spinning
      dispatch({ type: 'SET_PHASE', payload: 'SPINNING' });

      // Generate winning number
      const winningNumber = generateWinningNumber();
      dispatch({ type: 'SET_WINNING_NUMBER', payload: winningNumber });

      // Calculate winnings
      const totalWin = calculateTotalWins(state.activeBets, winningNumber);
      dispatch({ type: 'SET_LAST_WIN', payload: totalWin });

      // Add winnings to balance if any
      if (totalWin > 0) {
        const newBalance = localStorageService.addToBalance(totalWin);
        dispatch({ type: 'SET_PLAYER_COINS', payload: newBalance });
      }

      // Add to spin history
      localStorageService.addToHistory(winningNumber);
      const updatedHistory = localStorageService.getGameHistory();
      dispatch({ type: 'SET_SPIN_HISTORY', payload: updatedHistory });

      // Set phase to results after a brief delay
      setTimeout(() => {
        dispatch({ type: 'SET_PHASE', payload: 'RESULTS' });
      }, 1000);

    } catch (error) {
      console.error('Error during spin:', error);
      dispatch({ type: 'SET_ERROR', payload: 'An error occurred during spinning' });
      dispatch({ type: 'SET_PHASE', payload: 'BETTING' });
    }
  }, [state.phase, state.totalBet, state.activeBets, state.isLoadingBalance]);

  // Next round
  const nextRound = useCallback(() => {
    if (state.phase === 'RESULTS') {
      dispatch({ type: 'NEXT_ROUND' });
    }
  }, [state.phase]);

  // Refresh balance from localStorage
  const refreshBalance = useCallback(() => {
    try {
      const balance = localStorageService.getBalance();
      dispatch({ type: 'SET_PLAYER_COINS', payload: balance });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error refreshing balance:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh balance' });
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Context value
  const contextValue: GameContextType = {
    ...state,
    selectChip,
    placeBet,
    clearAllBets,
    repeatLastBets,
    spin,
    nextRound,
    refreshBalance,
    clearError
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// Hook to use game context
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};