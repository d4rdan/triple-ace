// client/pages/roulette.tsx
import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { Player, RouletteGameState, RouletteBet } from '../types';
import RouletteTable from '../components/games/roulette/RouletteTable';
import RouletteGameStatus from '../components/games/roulette/RouletteGameStatus';
import { useRouter } from 'next/router';

const RoulettePage: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const router = useRouter();

  const [gameState, setGameState] = useState<RouletteGameState>({
    phase: 'BETTING',
    winningNumber: null,
    timer: 30
  });
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomCode, setRoomCode] = useState('');
  const [myBets, setMyBets] = useState<RouletteBet[]>([]);
  const [selectedChip, setSelectedChip] = useState(10);

  useEffect(() => {
    if (!socket) return;

    socket.on('joined-roulette', (data: any) => {
      setRoomCode(data.roomCode);
      setGameState(data.gameState);
      setPlayers(data.players);
    });

    socket.on('bet-placed', (data: any) => {
      if (data.playerId === socket.id) {
        setMyBets(prev => [...prev, data.bet]);
      }
    });

    socket.on('roulette-spinning', () => {
      setGameState(prev => ({ ...prev, phase: 'SPINNING' }));
    });

    socket.on('roulette-results', (data: any) => {
      setGameState({
        phase: 'RESULTS',
        winningNumber: data.winningNumber,
        timer: 30
      });
    });

    socket.on('new-roulette-round', () => {
      setGameState({ phase: 'BETTING', winningNumber: null, timer: 30 });
      setMyBets([]);
    });

    return () => {
      socket.off('joined-roulette');
      socket.off('bet-placed');
      socket.off('roulette-spinning');
      socket.off('roulette-results');
      socket.off('new-roulette-round');
    };
  }, [socket]);

  const placeBet = (type: string, numbers: number[]) => {
    if (socket && gameState.phase === 'BETTING' && selectedChip > 0) {
      socket.emit('place-roulette-bet', {
        type,
        numbers,
        amount: selectedChip
      });
    }
  };

  const spinWheel = () => {
    if (socket && gameState.phase === 'BETTING') {
      socket.emit('spin-roulette');
    }
  };

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
    <div className="min-h-screen bg-green-800 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gray-800 p-4 rounded-lg text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">🎡 Multiplayer Roulette</h1>
            <div className="flex space-x-4 text-sm">
              <div>Room: <span className="text-yellow-400">{roomCode}</span></div>
              <div>Phase: <span className="text-blue-400">{gameState.phase}</span></div>
              <div>Players: <span className="text-green-400">{players.length}</span></div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
            >
              Leave Game
            </button>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-white font-bold mb-3">Players ({players.length})</h3>
          <div className="flex flex-wrap gap-3">
            {players.map(player => (
              <div key={player.id} className="bg-gray-600 p-2 rounded text-white text-sm">
                <div className="font-bold">{player.username}</div>
                <div className="text-yellow-400">${player.chips}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Status */}
        <RouletteGameStatus
          gameState={gameState}
          onSpin={spinWheel}
          canSpin={gameState.phase === 'BETTING'}
        />

        {/* Betting Table */}
        <RouletteTable
          onPlaceBet={placeBet}
          selectedChip={selectedChip}
          onChipSelect={setSelectedChip}
          disabled={gameState.phase !== 'BETTING'}
        />

        {/* My Bets */}
        {myBets.length > 0 && (
          <div className="bg-gray-600 p-4 rounded-lg">
            <h3 className="text-white font-bold mb-3">My Bets</h3>
            <div className="space-y-2">
              {myBets.map(bet => (
                <div key={bet.id} className="bg-gray-500 p-2 rounded text-white text-sm">
                  <span className="font-bold">{bet.type.toUpperCase()}</span> - 
                  <span className="text-yellow-400"> ${bet.amount}</span> on 
                  <span className="text-blue-400"> [{bet.numbers.join(', ')}]</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoulettePage;