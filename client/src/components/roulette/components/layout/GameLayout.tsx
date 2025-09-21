// src/components/roulette/components/layout/GameLayout.tsx

import React, { useState } from 'react';
// Remove this line: import { useSession } from 'next-auth/react';
import { useOrientation } from '../../hooks/useOrientation';
import { useGame } from '../../context/GameContext';
import { OrientationLock } from './OrientationLock';
import { ChipSelector } from '../game/ChipSelector';
import { BettingTableMobile } from '../game/BettingTableMobile';
import { BettingTableDesktop } from '../game/BettingTableDesktop';
import { RouletteWheel } from '../game/RouletteWheel';
import { SpinHistory } from '../game/SpinHistory';
import { ChipValue, BetType } from '../../types';
import { CHIP_VALUES } from '../../utils/constants';

const formatNumber = (num: number): string => {
  return Number(num.toFixed(2)).toString();
};

export const GameLayout: React.FC = () => {
  // Remove this line: const { data: session } = useSession();
  const { isLandscape, isMobile, screenWidth } = useOrientation();
  const game = useGame();
  const [showWheelModal, setShowWheelModal] = useState(false);

  // Handle placing a bet
  const handlePlaceBet = (position: string | number, type: BetType, numbers: number[]) => {
    game.placeBet(position, type, numbers);
  };

  // Handle spin - now async and shows modal
  const handleSpin = async () => {
    // Show wheel modal immediately
    setShowWheelModal(true);
    
    // Start the spin process
    await game.spin();
  };

  // Handle spin complete (called by wheel component)
  const handleSpinComplete = (number: number) => {
    // The context already handles this in the spin function
    // This is just for any additional UI updates if needed
  };

  // Handle next round
  const handleNextRound = () => {
    game.nextRound();
    // Close wheel modal when starting next round
    setShowWheelModal(false);
  };

  // Handle wheel modal close
  const handleWheelModalClose = () => {
    // Only allow closing if not spinning
    if (game.phase !== 'SPINNING') {
      setShowWheelModal(false);
    }
  };

  // Below 1024px (mobile/tablet) or 1024px+ (desktop)
  const isDesktop = screenWidth >= 1024;

  // Check if player has enough coins for repeat
  const canRepeat = game.lastBets.length > 0 && 
    game.lastBets.reduce((sum, bet) => sum + bet.amount, 0) <= game.playerCoins;

  // Remove the session check since we're using localStorage
  // No authentication needed with localStorage

  if (game.isLoadingBalance && game.playerCoins === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🎰</div>
          <div className="text-lg">Loading your balance...</div>
        </div>
      </div>
    );
  }

  return (
    <OrientationLock isLandscape={isLandscape} isMobile={isMobile}>
      <div className="bg-gray-900 text-white">
        {/* Error Display */}
        {game.error && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center justify-between">
              <span className="text-sm">{game.error}</span>
              <button 
                onClick={game.clearError}
                className="ml-2 text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {!isDesktop ? (
          // Mobile/Tablet Layout (< 1024px)
          <div className="h-screen w-screen flex flex-col overflow-hidden">
            {/* Header - 10% */}
            <div className="h-[10%] min-h-[40px] bg-emerald-900 border-b-2 border-yellow-500 flex items-center justify-between px-4">
              <div className="text-sm md:text-base font-bold">
                💰 {game.isLoadingBalance ? '...' : formatNumber(game.playerCoins)}
              </div>
              <div className="text-base md:text-xl font-bold">ROULETTE</div>
              <div className="text-sm md:text-base font-bold">BET: {formatNumber(game.totalBet)}</div>
            </div>
            
            {/* Betting Table - 60% */}
            <div className="h-[60%] bg-emerald-800 overflow-hidden">
              <BettingTableMobile
                activeBets={game.activeBets}
                selectedChip={game.selectedChip}
                onPlaceBet={handlePlaceBet}
                disabled={game.phase !== 'BETTING'}
              />
            </div>
            
            {/* Chip Selector - 15% */}
            <div className="h-[15%] min-h-[50px] bg-emerald-700 border-t border-emerald-600">
              <div className="h-full flex items-center justify-center">
                <div className="flex gap-2">
                  {CHIP_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => game.selectChip(game.selectedChip === value ? null : value)}
                      disabled={value > game.playerCoins - game.totalBet || game.phase !== 'BETTING'}
                      className={`
                        w-12 h-12 rounded-full text-xs font-bold transition-all relative
                        ${game.selectedChip === value ? 'ring-3 ring-yellow-400 scale-110' : ''}
                        ${value > game.playerCoins - game.totalBet || game.phase !== 'BETTING' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                        ${value === 0.1 ? 'bg-gradient-to-br from-red-400 to-red-600 border-2 border-red-700 text-white shadow-lg' :
                          value === 1 ? 'bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-blue-700 text-white shadow-lg' :
                          value === 5 ? 'bg-gradient-to-br from-green-400 to-green-600 border-2 border-green-700 text-white shadow-lg' :
                          value === 10 ? 'bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-orange-700 text-white shadow-lg' :
                          'bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-purple-700 text-white shadow-lg'}
                      `}
                    >
                      <div className="absolute inset-1 rounded-full border border-white/30"></div>
                      <span className="relative z-10">{formatNumber(value)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Game Controls - 15% */}
            <div className="h-[15%] min-h-[50px] bg-emerald-600 flex items-center justify-center gap-2 sm:gap-4 px-4">
              {game.phase === 'BETTING' && (
                <>
                  <button 
                    onClick={handleSpin}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-yellow-500 text-gray-900 font-bold rounded hover:bg-yellow-400 transition-colors text-sm sm:text-base"
                    disabled={game.totalBet === 0 || game.isLoadingBalance}
                  >
                    {game.isLoadingBalance ? 'LOADING...' : 'SPIN'}
                  </button>
                  <button 
                    onClick={game.clearAllBets}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 text-white font-bold rounded hover:bg-gray-600 transition-colors text-sm sm:text-base"
                    disabled={game.activeBets.length === 0 || game.isLoadingBalance}
                  >
                    CLEAR
                  </button>
                  <button 
                    onClick={game.repeatLastBets}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 text-white font-bold rounded hover:bg-gray-600 transition-colors text-sm sm:text-base"
                    disabled={!canRepeat || game.isLoadingBalance}
                  >
                    REPEAT
                  </button>
                </>
              )}
              {game.phase === 'SPINNING' && (
                <div className="text-lg font-bold">SPINNING...</div>
              )}
              {game.phase === 'RESULTS' && (
                <>
                  <div className="text-lg font-bold">
                    {game.lastWin > 0 ? `WIN: ${formatNumber(game.lastWin)}` : 'NO WIN'}
                  </div>
                  <button 
                    onClick={handleNextRound}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-yellow-500 text-gray-900 font-bold rounded hover:bg-yellow-400 transition-colors text-sm sm:text-base"
                  >
                    NEXT ROUND
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          // Desktop Layout (1024px+)
          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="h-20 bg-emerald-900 border-b-2 border-yellow-500 flex items-center justify-between px-8">
              <div className="font-bold text-lg">
                BALANCE: {game.isLoadingBalance ? 'Loading...' : formatNumber(game.playerCoins)}
                {game.isLoadingBalance && (
                  <button 
                    onClick={game.refreshBalance}
                    className="ml-2 text-sm text-yellow-400 hover:text-yellow-300"
                  >
                    🔄
                  </button>
                )}
              </div>
              <div className="text-3xl font-bold">EUROPEAN ROULETTE</div>
              <div className="font-bold text-lg">TOTAL BET: {formatNumber(game.totalBet)}</div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Top Section - Chip Selector and Game Controls ONLY */}
              <div className="flex h-[35%] min-h-[250px]">
                {/* Chip Selector */}
                <div className="w-[50%] bg-gray-700 border-r border-gray-600">
                  <ChipSelector
                    selectedChip={game.selectedChip}
                    playerCoins={game.playerCoins - game.totalBet}
                    onSelectChip={game.selectChip}
                  />
                </div>
                
                {/* Game Controls */}
                <div className="w-[50%] bg-gray-800 flex items-center justify-center p-8">
                  <div className="text-center">
                    {game.phase === 'BETTING' && (
                      <div className="space-y-4">
                        <div className="text-2xl font-bold text-yellow-400 mb-6">Ready to Spin!</div>
                        <div className="flex gap-4 justify-center">
                          <button 
                            onClick={handleSpin}
                            className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 font-bold rounded-xl hover:from-yellow-400 hover:to-yellow-300 transition-all text-xl shadow-lg transform hover:scale-105"
                            disabled={game.totalBet === 0 || game.isLoadingBalance}
                          >
                            {game.isLoadingBalance ? 'LOADING...' : 'SPIN WHEEL'}
                          </button>
                        </div>
                        <div className="flex gap-3 justify-center mt-6">
                          <button 
                            onClick={game.clearAllBets}
                            className="px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors"
                            disabled={game.activeBets.length === 0 || game.isLoadingBalance}
                          >
                            CLEAR BETS
                          </button>
                          <button 
                            onClick={game.repeatLastBets}
                            className="px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors"
                            disabled={!canRepeat || game.isLoadingBalance}
                          >
                            REPEAT LAST
                          </button>
                        </div>
                      </div>
                    )}
                    {game.phase === 'SPINNING' && (
                      <div className="text-center">
                        <div className="animate-spin text-6xl mb-4">🎰</div>
                        <div className="text-3xl font-bold">SPINNING...</div>
                        <div className="text-lg text-gray-400 mt-2">Good luck!</div>
                      </div>
                    )}
                    {game.phase === 'RESULTS' && (
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-6">
                          {game.lastWin > 0 ? (
                            <span className="text-green-400">WIN: {formatNumber(game.lastWin)} coins!</span>
                          ) : (
                            <span className="text-red-400">No Win</span>
                          )}
                        </div>
                        <button 
                          onClick={handleNextRound}
                          className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-400 text-white font-bold rounded-xl hover:from-green-400 hover:to-green-300 transition-all text-xl shadow-lg transform hover:scale-105"
                        >
                          NEXT ROUND
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Betting Table - EXPANDED TO TAKE MORE SPACE */}
              <div className="flex-1 bg-emerald-800">
                <BettingTableDesktop
                  activeBets={game.activeBets}
                  selectedChip={game.selectedChip}
                  onPlaceBet={handlePlaceBet}
                  disabled={game.phase !== 'BETTING'}
                />
              </div>
              
              {/* Spin History - FULL WIDTH */}
              <div className="h-20 bg-gray-800 border-t-2 border-gray-700">
                <SpinHistory history={game.spinHistory} />
              </div>
            </div>
          </div>
        )}
        
        {/* WHEEL MODAL - Shows for both mobile and desktop after spin */}
        {showWheelModal && (
          <RouletteWheel
            isMobile={true} // Always use modal mode
            isSpinning={game.phase === 'SPINNING'}
            onSpinComplete={handleSpinComplete}
            onClose={handleWheelModalClose}
          />
        )}
        
        {/* Debug info */}
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 p-2 text-xs rounded z-50">
          <div>Width: {screenWidth}px</div>
          <div>Device: {isDesktop ? 'Desktop' : 'Mobile/Tablet'}</div>
          <div>Phase: {game.phase}</div>
          <div>Balance: {formatNumber(game.playerCoins)}</div>
          <div>Last Win: {formatNumber(game.lastWin)}</div>
          <div>Modal: {showWheelModal ? 'Open' : 'Closed'}</div>
          {game.error && <div className="text-red-400">Error: {game.error}</div>}
        </div>
      </div>
    </OrientationLock>
  );
};