// src/services/localStorageService.ts

interface PlayerData {
    balance: number;
    lastUpdated: number;
  }
  
  const STORAGE_KEYS = {
    PLAYER_BALANCE: 'roulette_player_balance',
    GAME_HISTORY: 'roulette_game_history',
    SETTINGS: 'roulette_settings'
  } as const;
  
  const DEFAULT_BALANCE = 1000; // Starting balance for new players
  
  export const localStorageService = {
    /**
     * Get player balance from localStorage
     */
    getBalance(): number {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.PLAYER_BALANCE);
        if (!stored) {
          // First time player - set default balance
          this.setBalance(DEFAULT_BALANCE);
          return DEFAULT_BALANCE;
        }
  
        const playerData: PlayerData = JSON.parse(stored);
        return Math.max(0, playerData.balance); // Ensure balance is never negative
      } catch (error) {
        console.error('Error getting balance from localStorage:', error);
        // Fallback to default
        this.setBalance(DEFAULT_BALANCE);
        return DEFAULT_BALANCE;
      }
    },
  
    /**
     * Set player balance in localStorage
     */
    setBalance(balance: number): void {
      try {
        const playerData: PlayerData = {
          balance: Math.max(0, balance), // Ensure balance is never negative
          lastUpdated: Date.now()
        };
        localStorage.setItem(STORAGE_KEYS.PLAYER_BALANCE, JSON.stringify(playerData));
      } catch (error) {
        console.error('Error setting balance in localStorage:', error);
      }
    },
  
    /**
     * Add to player balance
     */
    addToBalance(amount: number): number {
      const currentBalance = this.getBalance();
      const newBalance = currentBalance + amount;
      this.setBalance(newBalance);
      return newBalance;
    },
  
    /**
     * Subtract from player balance
     */
    subtractFromBalance(amount: number): { success: boolean; newBalance: number; error?: string } {
      const currentBalance = this.getBalance();
      
      if (amount > currentBalance) {
        return {
          success: false,
          newBalance: currentBalance,
          error: 'Insufficient balance'
        };
      }
  
      const newBalance = currentBalance - amount;
      this.setBalance(newBalance);
      
      return {
        success: true,
        newBalance
      };
    },
  
    /**
     * Reset player balance to default
     */
    resetBalance(): number {
      this.setBalance(DEFAULT_BALANCE);
      return DEFAULT_BALANCE;
    },
  
    /**
     * Get game history
     */
    getGameHistory(): number[] {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('Error getting game history:', error);
        return [];
      }
    },
  
    /**
     * Add a spin result to history
     */
    addToHistory(winningNumber: number): void {
      try {
        const history = this.getGameHistory();
        history.unshift(winningNumber); // Add to beginning
        
        // Keep only last 10 spins
        const trimmedHistory = history.slice(0, 10);
        
        localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(trimmedHistory));
      } catch (error) {
        console.error('Error adding to game history:', error);
      }
    },
  
    /**
     * Clear all game data
     */
    clearAllData(): void {
      try {
        Object.values(STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
        });
      } catch (error) {
        console.error('Error clearing game data:', error);
      }
    },
  
    /**
     * Check if localStorage is available
     */
    isAvailable(): boolean {
      try {
        const testKey = '__localStorage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        return true;
      } catch {
        return false;
      }
    }
  };