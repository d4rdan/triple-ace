// client/components/games/poker/PokerActions.tsx
import React, { useState } from 'react';
import { PokerPlayer, PokerGameState } from '../../../types';

interface PokerActionsProps {
  player: PokerPlayer;
  gameState: PokerGameState;
  onAction: (action: string, amount?: number) => void;
  isMyTurn: boolean;
}

const PokerActions: React.FC<PokerActionsProps> = ({
  player,
  gameState,
  onAction,
  isMyTurn
}) => {
  const [raiseAmount, setRaiseAmount] = useState(gameState.currentBet + 20);

  const callAmount = Math.max(0, gameState.currentBet - player.currentBet);
  const canCheck = gameState.currentBet === player.currentBet;
  const minRaise = gameState.currentBet + 10;
  const maxRaise = player.chips + player.currentBet;

  if (!isMyTurn || player.folded) {
    return (
      <div className="bg-gray-700 p-4 rounded-lg text-center">
        <div className="text-white text-lg">
          {player.folded ? 'You have folded' : 'Waiting for other players...'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <h3 className="text-white font-bold text-center mb-4">Your Turn - Choose Action</h3>
      
      {/* Action Buttons */}
      <div className="flex justify-center space-x-3 mb-4">
        <button
          onClick={() => onAction('fold')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Fold
        </button>

        {canCheck ? (
          <button
            onClick={() => onAction('call')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Check
          </button>
        ) : (
          <button
            onClick={() => onAction('call')}
            disabled={callAmount > player.chips}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Call ${callAmount}
          </button>
        )}

        {/* Raise Controls */}
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(Number(e.target.value))}
            min={minRaise}
            max={maxRaise}
            className="w-20 p-2 bg-gray-600 text-white rounded text-center"
          />
          <button
            onClick={() => onAction('raise', raiseAmount)}
            disabled={raiseAmount < minRaise || raiseAmount > maxRaise}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Raise
          </button>
        </div>
      </div>

      {/* Player Stats */}
      <div className="text-center text-gray-300 text-sm space-y-1">
        <div>Your chips: ${player.chips}</div>
        <div>Current bet: ${player.currentBet}</div>
        {!canCheck && <div>To call: ${callAmount}</div>}
      </div>
    </div>
  );
};

export default PokerActions;
