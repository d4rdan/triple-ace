// /client/src/components/platform/PlatformProvider.tsx - Next.js compatible
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface PlatformContextType {
  // Current game state
  currentGame: string | null;
  setCurrentGame: (game: string | null) => void;
  
  // Player data
  playerBalance: number;
  setPlayerBalance: (balance: number | ((prev: number) => number)) => void;
  playerName: string;
  setPlayerName: (name: string) => void;
  
  // Platform settings
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  
  // Session management
  sessionId: string;
  isOnline: boolean;
}

const PlatformContext = createContext<PlatformContextType | null>(null);

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within PlatformProvider');
  }
  return context;
};

interface PlatformProviderProps {
  children: React.ReactNode;
}

export const PlatformProvider: React.FC<PlatformProviderProps> = ({ children }) => {
  // Game state
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  
  // Player state with default values
  const [playerBalance, setPlayerBalance] = useState(1000);
  const [playerName, setPlayerName] = useState('Player');
  
  // Settings with default values
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // Session
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isOnline, setIsOnline] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true after component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load saved data from localStorage only on client-side
  useEffect(() => {
    if (!isClient) return;

    try {
      const savedData = localStorage.getItem('gaming-platform-data');
      if (savedData) {
        const data = JSON.parse(savedData);
        setPlayerBalance(data.playerBalance || 1000);
        setPlayerName(data.playerName || 'Player');
        setSoundEnabled(data.soundEnabled ?? true);
        setTheme(data.theme || 'dark');
      }
    } catch (error) {
      console.error('Failed to load saved data:', error);
    }
  }, [isClient]);

  // Save data to localStorage when state changes (client-side only)
  useEffect(() => {
    if (!isClient) return;

    try {
      const dataToSave = {
        playerBalance,
        playerName,
        soundEnabled,
        theme
      };
      localStorage.setItem('gaming-platform-data', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }, [playerBalance, playerName, soundEnabled, theme, isClient]);

  // Monitor online status (client-side only)
  useEffect(() => {
    if (!isClient) return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    // Set initial online status
    setIsOnline(navigator.onLine);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isClient]);

  const value: PlatformContextType = {
    currentGame,
    setCurrentGame,
    playerBalance,
    setPlayerBalance,
    playerName,
    setPlayerName,
    soundEnabled,
    setSoundEnabled,
    theme,
    setTheme,
    sessionId,
    isOnline
  };

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
};