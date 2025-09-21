// /client/src/components/poker/PokerGame.tsx
import React, { useState } from 'react';
import { Home, Users, Coins, Settings, Play, Info } from 'lucide-react';
import { usePlatform } from '../platform/PlatformProvider';
import { PokerGameProvider, usePokerGame } from './context/PokerGameContext';
import { PokerTable } from './components/PokerTable';
import { PokerLobby } from './components/PokerLobby';
import { ActionButtons } from './components/ActionButtons';
import { GameInfo } from './components/GameInfo';

const PokerGameContent: React.FC = () => {
  const { setCurrentGame } = usePlatform();
  const { gameState, isConnected, isConnecting, error } = usePokerGame();
  const [showInfo, setShowInfo] = useState(false);

  if (!isConnected && !isConnecting) {
    return <PokerLobby />;
  }

  if (isConnecting) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Connecting to Poker Room...</h2>
          <p className="text-blue-200">Please wait while we set up your table</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
          <p className="text-red-200 mb-4">{error}</p>
          <button
            onClick={() => setCurrentGame(null)}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm p-4 flex justify-between items-center border-b border-white/10">
        <button
          onClick={() => setCurrentGame(null)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
        >
          <Home size={20} />
          Leave Table
        </button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold">Texas Hold'em Poker</h1>
          <div className="text-sm opacity-80">
            Room: {gameState?.gamePhase || 'Waiting'} • Round: {gameState?.round || 1}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-colors"
          >
            <Info size={20} />
          </button>
          <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg">
            <Users size={20} />
            <span>{gameState?.players.length || 0}/8</span>
          </div>
        </div>
      </div>

      {/* Game Info Panel */}
      {showInfo && <GameInfo />}

      {/* Main Game Area */}
      <div className="flex-1 relative overflow-hidden">
        <PokerTable />
        <ActionButtons />
      </div>
    </div>
  );
};

export const PokerGame: React.FC = () => {
  return (
    <PokerGameProvider>
      <PokerGameContent />
    </PokerGameProvider>
  );
};