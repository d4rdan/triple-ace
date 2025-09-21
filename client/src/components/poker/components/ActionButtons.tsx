// /client/src/components/poker/components/ActionButtons.tsx - Fixed
import React, { useState } from 'react';
import { usePokerGame } from '../context/PokerGameContext';

export const ActionButtons: React.FC = () => {
  const {
    isMyTurn,
    canCheck,
    canCall,
    canRaise,
    callAmount,
    minRaise,
    maxRaise,
    myPlayer,
    fold,
    check,
    call,
    raise,
    allIn
  } = usePokerGame();

  const [raiseAmount, setRaiseAmount] = useState(minRaise);
  const [showRaiseInput, setShowRaiseInput] = useState(false);

  // Don't show buttons if it's not the player's turn or if player doesn't exist
  if (!isMyTurn || !myPlayer) {
    return null;
  }

  const handleRaise = () => {
    if (raiseAmount >= minRaise && raiseAmount <= maxRaise) {
      raise(raiseAmount);
      setShowRaiseInput(false);
      setRaiseAmount(minRaise);
    }
  };

  const handleAllIn = () => {
    allIn();
    setShowRaiseInput(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-black/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <div className="text-center mb-3">
          <div className="text-sm text-yellow-400 font-medium">Your Turn</div>
          <div className="text-xs text-gray-300">Choose your action</div>
        </div>

        {/* Main Action Buttons */}
        <div className="flex gap-2 mb-3">
          {/* Fold Button */}
          <button
            onClick={fold}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Fold
          </button>

          {/* Check/Call Button */}
          {canCheck ? (
            <button
              onClick={check}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Check
            </button>
          ) : canCall ? (
            <button
              onClick={call}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Call ${callAmount}
            </button>
          ) : null}

          {/* Raise Button */}
          {canRaise && (
            <button
              onClick={() => setShowRaiseInput(!showRaiseInput)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Raise
            </button>
          )}

          {/* All-in Button */}
          {myPlayer.chips > 0 && (
            <button
              onClick={handleAllIn}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
            >
              All-in
            </button>
          )}
        </div>

        {/* Raise Input */}
        {showRaiseInput && canRaise && (
          <div className="border-t border-white/20 pt-3">
            <div className="text-sm text-gray-300 mb-2">Raise Amount:</div>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={minRaise}
                max={maxRaise}
                value={raiseAmount}
                onChange={(e) => setRaiseAmount(Number(e.target.value))}
                className="flex-1 px-3 py-2 bg-black/40 border border-gray-600 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
              />
              <button
                onClick={handleRaise}
                disabled={raiseAmount < minRaise || raiseAmount > maxRaise}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
              >
                Raise
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Min: ${minRaise} • Max: ${maxRaise}
            </div>
          </div>
        )}

        {/* Player Info */}
        <div className="border-t border-white/20 pt-3 mt-3 text-center">
          <div className="text-sm text-gray-300">Your Chips</div>
          <div className="text-lg font-bold text-green-400">
            ${myPlayer.chips.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};