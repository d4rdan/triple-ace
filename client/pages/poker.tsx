// client/pages/poker.tsx
import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { PokerPlayer, PokerGameState } from '../types';
import PokerTable from '../components/games/poker/PokerTable';
import PokerActions from '../components/games/poker/PokerActions';
import { useRouter } from 'next/router';

const PokerPage: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const router = useRouter();

  const [gameState, setGameState] = useState<PokerGameState>({
    phase: 'WAITING',
    communityCards: [],
    pot: 0,
    currentBet: 0,
    currentPlayer: 0,
    dealerPosition: 0
  });
  const [players, setPlayers] = useState<PokerPlayer[]>([]);
  const [roomCode, setRoomCode] = useState('');

  useEffect(() => {
    if (!socket) return;

    socket.on('joined-poker', (data: any) => {
      setRoomCode(data.roomCode);
      setGameState(data.gameState);
      setPlayers(data.players);
    });

    socket.on('poker-dealt', (data: any) => {
      setGameState(data.gameState);
      setPlayers(data.players);
    });

    socket.on('poker-action-made', (data: any) => {
      setGameState(data.gameState);
      setPlayers(data.players);
    });

    return () => {
      socket.off('joined-poker');
      socket.off('poker-dealt');
      socket.off('poker-action-made');
    };
  }, [socket]);

  const startGame = () => {
    if (socket) {
      socket.emit('start-poker');
    }
  };

  const makeAction = (type: string, amount?: number) => {
    if (socket) {
      socket.emit('poker-action', { type, amount });
    }
  };

  const myPlayer = players.find(p => p.id === socket?.id);
  const isMyTurn = myPlayer && gameState.currentPlayer === myPlayer.position;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-4">🔌</div>
          <div>Connecting to server...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gray-800 p-4 rounded-lg text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">🃏 Multiplayer Poker</h1>
            <div className="flex space-x-4 text-sm">
              <div>Room: <span className="text-yellow-400">{roomCode}</span></div>
              <div>Phase: <span className="text-blue-400">{gameState.phase}</span></div>
              <div>Pot: <span className="text-green-400">${gameState.pot}</span></div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
            >
              Leave Game
            </button>
          </div>
        </div>

        {/* Game Controls for Waiting Phase */}
        {gameState.phase === 'WAITING' && (
          <div className="bg-gray-700 p-6 rounded-lg text-center">
            <h2 className="text-white text-xl font-bold mb-4">
              Waiting for Players ({players.length}/6)
            </h2>
            <button
              onClick={startGame}
              disabled={players.length < 2}
              className="px-8 py-3 bg-green-600 text-white font-bold text-lg rounded-lg 
                       hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Game (Minimum 2 players)
            </button>
          </div>
        )}

        {/* Poker Table */}
        <PokerTable
          players={players}
          gameState={gameState}
          currentPlayerId={socket?.id || ''}
        />

        {/* Player Actions */}
        {gameState.phase === 'BETTING' && myPlayer && (
          <PokerActions
            player={myPlayer}
            gameState={gameState}
            onAction={makeAction}
            isMyTurn={!!isMyTurn}
          />
        )}

        {/* Game Status Messages */}
        <div className="bg-gray-600 p-4 rounded-lg text-center">
          {gameState.phase === 'DEALING' && (
            <div className="text-white text-xl font-bold">
              🃏 Dealing cards...
            </div>
          )}
          
          {gameState.phase === 'SHOWDOWN' && (
            <div className="text-white text-xl font-bold">
              🏆 Showdown! Revealing cards...
            </div>
          )}
          
          {gameState.phase === 'BETTING' && !isMyTurn && myPlayer && !myPlayer.folded && (
            <div className="text-white">
              <div className="text-lg">Waiting for other players to act...</div>
              <div className="text-gray-300 text-sm mt-2">
                Current bet: ${gameState.currentBet} | Your bet: ${myPlayer.currentBet}
              </div>
            </div>
          )}
        </div>

        {/* Game Instructions */}
        <div className="bg-gray-600 p-4 rounded-lg text-white text-sm">
          <h3 className="font-bold mb-2">How to Play:</h3>
          <ul className="space-y-1 text-gray-300 list-disc list-inside">
            <li>Each player gets 2 hole cards</li>
            <li>5 community cards are revealed: Flop (3), Turn (+1), River (+1)</li>
            <li>Make the best 5-card hand from your 2 cards + 5 community cards</li>
            <li>Fold to quit the hand, Call to match the current bet, Raise to increase</li>
            <li>Player with the best hand wins the pot</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PokerPage;