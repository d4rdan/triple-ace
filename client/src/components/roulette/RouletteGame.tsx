// /client/src/components/roulette/RouletteGame.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Home, Play, RotateCcw, Volume2, VolumeX, Coins, History } from 'lucide-react';
import { usePlatform } from '../platform/PlatformProvider';
import { useRouletteGame } from './hooks/useRouletteGame';
import { RouletteWheel } from './components/RouletteWheel';
import { BettingTable } from './components/BettingTable';
import { ChipSelector } from './components/ChipSelector';
import { SpinHistory } from './components/SpinHistory';
import { BetDisplay } from './components/BetDisplay';

export const RouletteGame: React.FC = () => {
  const { setCurrentGame, playerBalance, setPlayerBalance, soundEnabled } = usePlatform();
  const {
    selectedChip,
    setSelectedChip,
    bets,
    isSpinning,
    winningNumber,
    spinHistory,
    showResult,
    placeBet,
    spin,
    clearBets,
    repeatLastBets,
    canRepeat
  } = useRouletteGame(playerBalance, setPlayerBalance);

  const [showHistory, setShowHistory] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const totalBet = bets.reduce((sum, bet) => sum + bet.amount, 0);
  const canSpin = bets.length > 0 && !isSpinning;

  // Calculate statistics
  const stats = React.useMemo(() => {
    const totalSpins = spinHistory.length;
    const redCount = spinHistory.filter(n => [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(n)).length;
    const blackCount = spinHistory.filter(n => [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35].includes(n)).length;
    const zeroCount = spinHistory.filter(n => n === 0).length;
    
    return {
      totalSpins,
      redPercentage: totalSpins > 0 ? ((redCount / totalSpins) * 100).toFixed(1) : '0.0',
      blackPercentage: totalSpins > 0 ? ((blackCount / totalSpins) * 100).toFixed(1) : '0.0',
      zeroPercentage: totalSpins > 0 ? ((zeroCount / totalSpins) * 100).toFixed(1) : '0.0'
    };
  }, [spinHistory]);

  return (
    <div className="h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-green-800/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-green-700/50">
        <button
          onClick={() => setCurrentGame(null)}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-600 px-4 py-2 rounded-lg transition-colors"
        >
          <Home size={20} />
          Back to Lobby
        </button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold">European Roulette</h1>
          <div className="text-sm opacity-80">Single Zero • House Edge: 2.7%</div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowStats(!showStats)}
            className="bg-green-700 hover:bg-green-600 p-2 rounded-lg transition-colors"
          >
            <History size={20} />
          </button>
          <div className="flex items-center gap-2 bg-green-700/50 px-4 py-2 rounded-lg">
            <Coins size={20} className="text-yellow-400" />
            <span className="font-bold">${playerBalance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <div className="bg-green-800/90 backdrop-blur-sm p-4 border-b border-green-700/50">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-lg font-bold mb-3">Game Statistics</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-green-700/50 p-3 rounded-lg">
                <div className="text-2xl font-bold">{stats.totalSpins}</div>
                <div className="text-sm opacity-80">Total Spins</div>
              </div>
              <div className="bg-red-600/30 p-3 rounded-lg">
                <div className="text-2xl font-bold text-red-400">{stats.redPercentage}%</div>
                <div className="text-sm opacity-80">Red Numbers</div>
              </div>
              <div className="bg-gray-600/30 p-3 rounded-lg">
                <div className="text-2xl font-bold text-gray-300">{stats.blackPercentage}%</div>
                <div className="text-sm opacity-80">Black Numbers</div>
              </div>
              <div className="bg-green-600/30 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{stats.zeroPercentage}%</div>
                <div className="text-sm opacity-80">Zero</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex min-h-0">
        {/* Main Game Area */}
        <div className="flex-1 flex flex-col p-6 min-w-0">
          {/* Wheel and Result */}
          <div className="flex justify-center items-center mb-6 flex-shrink-0">
            <div className="text-center">
              <RouletteWheel 
                isSpinning={isSpinning} 
                winningNumber={winningNumber}
                showResult={showResult}
              />
              
              {/* Result Display */}
              {showResult && winningNumber !== null && (
                <div className="mt-4 animate-pulse">
                  <div className="text-lg font-bold mb-2">Winning Number:</div>
                  <div className={`inline-block px-6 py-3 rounded-lg text-3xl font-bold border-2 ${
                    winningNumber === 0 
                      ? 'bg-green-600 border-green-400' 
                      : [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(winningNumber)
                        ? 'bg-red-600 border-red-400'
                        : 'bg-gray-800 border-gray-600'
                  }`}>
                    {winningNumber}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Betting Table */}
          <div className="flex-1 min-h-0">
            <BettingTable 
              onPlaceBet={placeBet}
              selectedChip={selectedChip}
              disabled={isSpinning}
              bets={bets}
            />
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-80 bg-green-800/50 backdrop-blur-sm p-6 border-l border-green-700/50 flex flex-col">
          {/* Chip Selector */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-yellow-500 rounded-full"></span>
              Select Chip Value
            </h3>
            <ChipSelector 
              selectedChip={selectedChip}
              onChipSelect={setSelectedChip}
              disabled={isSpinning}
            />
          </div>

          {/* Current Bets */}
          <div className="mb-6 flex-1 min-h-0">
            <h3 className="text-lg font-bold mb-3">Current Bets</h3>
            <BetDisplay bets={bets} />
            <div className="mt-3 p-3 bg-green-700/50 rounded-lg">
              <div className="font-bold text-lg">
                Total Bet: ${totalBet.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3 flex-shrink-0">
            <button
              onClick={spin}
              disabled={!canSpin}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed p-4 rounded-lg font-bold text-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 disabled:hover:scale-100"
            >
              <Play size={24} />
              {isSpinning ? 'Spinning...' : 'SPIN'}
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={clearBets}
                disabled={bets.length === 0 || isSpinning}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed p-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw size={18} />
                Clear
              </button>
              
              <button
                onClick={repeatLastBets}
                disabled={!canRepeat || isSpinning}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed p-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Play size={18} />
                Repeat
              </button>
            </div>
          </div>

          {/* Spin History */}
          <div className="mt-6 flex-shrink-0">
            <h3 className="text-lg font-bold mb-3 flex items-center justify-between">
              Recent Numbers
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm bg-green-700 hover:bg-green-600 px-2 py-1 rounded transition-colors"
              >
                {showHistory ? 'Hide' : 'Show All'}
              </button>
            </h3>
            <SpinHistory 
              history={spinHistory}
              showAll={showHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
};