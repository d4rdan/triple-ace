// /client/src/components/roulette/hooks/useRouletteGame.tsx
import { useState, useCallback } from 'react';
import { usePlatform } from '../../platform/PlatformProvider';

export interface Bet {
  id: string;
  position: string | number;
  amount: number;
  type: BetType;
  numbers: number[];
}

export type BetType = 
  | 'straight' | 'split' | 'street' | 'corner' | 'sixLine'
  | 'dozen1' | 'dozen2' | 'dozen3' 
  | 'column1' | 'column2' | 'column3'
  | 'red' | 'black' | 'odd' | 'even' | 'low' | 'high';

export type ChipValue = 0.1 | 1 | 5 | 10 | 20;

const CHIP_VALUES: ChipValue[] = [0.1, 1, 5, 10, 20];

const PAYOUTS: Record<BetType, number> = {
  straight: 35, split: 17, street: 11, corner: 8, sixLine: 5,
  dozen1: 2, dozen2: 2, dozen3: 2,
  column1: 2, column2: 2, column3: 2,
  red: 1, black: 1, odd: 1, even: 1, low: 1, high: 1
};

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

export const useRouletteGame = (
  playerBalance: number, 
  setPlayerBalance: (balance: number | ((prev: number) => number)) => void
) => {
  const { soundEnabled } = usePlatform();
  
  // Game state
  const [selectedChip, setSelectedChip] = useState<ChipValue>(1);
  const [bets, setBets] = useState<Bet[]>([]);
  const [lastBets, setLastBets] = useState<Bet[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [spinHistory, setSpinHistory] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  // Generate unique bet ID
  const generateBetId = () => `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Get numbers for different bet types
  const getNumbersForBet = (position: string | number, type: BetType): number[] => {
    switch (type) {
      case 'straight':
        return [position as number];
      case 'red':
        return RED_NUMBERS;
      case 'black':
        return BLACK_NUMBERS;
      case 'odd':
        return Array.from({ length: 36 }, (_, i) => i + 1).filter(n => n % 2 === 1);
      case 'even':
        return Array.from({ length: 36 }, (_, i) => i + 1).filter(n => n % 2 === 0);
      case 'low':
        return Array.from({ length: 18 }, (_, i) => i + 1);
      case 'high':
        return Array.from({ length: 18 }, (_, i) => i + 19);
      case 'dozen1':
        return Array.from({ length: 12 }, (_, i) => i + 1);
      case 'dozen2':
        return Array.from({ length: 12 }, (_, i) => i + 13);
      case 'dozen3':
        return Array.from({ length: 12 }, (_, i) => i + 25);
      case 'column1':
        return Array.from({ length: 12 }, (_, i) => 1 + i * 3);
      case 'column2':
        return Array.from({ length: 12 }, (_, i) => 2 + i * 3);
      case 'column3':
        return Array.from({ length: 12 }, (_, i) => 3 + i * 3);
      default:
        return [];
    }
  };

  // Place a bet
  const placeBet = useCallback((position: string | number, type: BetType, numbers?: number[]) => {
    if (playerBalance < selectedChip || isSpinning) return;

    const betNumbers = numbers || getNumbersForBet(position, type);
    
    const newBet: Bet = {
      id: generateBetId(),
      position,
      amount: selectedChip,
      type,
      numbers: betNumbers
    };

    setBets(prev => [...prev, newBet]);
    setPlayerBalance(prev => prev - selectedChip);

    // Play sound effect
    if (soundEnabled) {
      playSound('chipPlace');
    }
  }, [selectedChip, playerBalance, isSpinning, soundEnabled, setPlayerBalance]);

  // Clear all bets
  const clearBets = useCallback(() => {
    if (isSpinning) return;
    
    const totalBet = bets.reduce((sum, bet) => sum + bet.amount, 0);
    setPlayerBalance(prev => prev + totalBet);
    setBets([]);

    if (soundEnabled) {
      playSound('chipRemove');
    }
  }, [bets, isSpinning, soundEnabled, setPlayerBalance]);

  // Repeat last bets
  const repeatLastBets = useCallback(() => {
    if (isSpinning || lastBets.length === 0) return;
    
    const totalCost = lastBets.reduce((sum, bet) => sum + bet.amount, 0);
    if (playerBalance < totalCost) return;

    const newBets = lastBets.map(bet => ({
      ...bet,
      id: generateBetId()
    }));

    setBets(newBets);
    setPlayerBalance(prev => prev - totalCost);

    if (soundEnabled) {
      playSound('chipPlace');
    }
  }, [lastBets, playerBalance, isSpinning, soundEnabled, setPlayerBalance]);

  // Check if bet wins
  const isBetWinner = (bet: Bet, number: number): boolean => {
    return bet.numbers.includes(number);
  };

  // Calculate win amount
  const calculateWinAmount = (bet: Bet): number => {
    const payout = PAYOUTS[bet.type];
    return bet.amount * (payout + 1); // Including original bet
  };

  // Spin the wheel
  const spin = useCallback(async () => {
    if (bets.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setShowResult(false);
    setLastBets([...bets]); // Save current bets for repeat functionality

    if (soundEnabled) {
      playSound('spin');
    }

    // Simulate spin duration
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Generate winning number
    const result = Math.floor(Math.random() * 37);
    setWinningNumber(result);
    setSpinHistory(prev => [result, ...prev.slice(0, 19)]); // Keep last 20

    // Calculate wins
    let totalWin = 0;
    bets.forEach(bet => {
      if (isBetWinner(bet, result)) {
        totalWin += calculateWinAmount(bet);
      }
    });

    if (totalWin > 0) {
      setPlayerBalance(prev => prev + totalWin);
      if (soundEnabled) {
        playSound('win');
      }
    } else {
      if (soundEnabled) {
        playSound('lose');
      }
    }

    setIsSpinning(false);
    setShowResult(true);

    // Clear bets and hide result after delay
    setTimeout(() => {
      setBets([]);
      setShowResult(false);
    }, 4000);
  }, [bets, isSpinning, soundEnabled, setPlayerBalance]);

  // Simple sound effects using Web Audio API
  const playSound = (type: string) => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      let frequency = 440;
      let duration = 0.1;

      switch (type) {
        case 'chipPlace':
          frequency = 800;
          duration = 0.1;
          break;
        case 'chipRemove':
          frequency = 600;
          duration = 0.1;
          break;
        case 'spin':
          frequency = 400;
          duration = 0.3;
          break;
        case 'win':
          frequency = 1000;
          duration = 0.5;
          break;
        case 'lose':
          frequency = 300;
          duration = 0.3;
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

  // Check if repeat is possible
  const canRepeat = lastBets.length > 0 && 
    lastBets.reduce((sum, bet) => sum + bet.amount, 0) <= playerBalance;

  return {
    // State
    selectedChip,
    bets,
    lastBets,
    isSpinning,
    winningNumber,
    spinHistory,
    showResult,
    canRepeat,
    
    // Actions
    setSelectedChip,
    placeBet,
    clearBets,
    repeatLastBets,
    spin,
    
    // Constants
    CHIP_VALUES,
    RED_NUMBERS,
    BLACK_NUMBERS,
    PAYOUTS
  };
};