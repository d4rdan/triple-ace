// /client/src/components/poker/components/PokerLobby.tsx
import React, { useState } from 'react';
import { Play, Users, Home, Shuffle, Clock, Coins } from 'lucide-react';
import { usePlatform } from '../../platform/PlatformProvider';
import { usePokerGame } from '../context/PokerGameContext';

export const PokerLobby: React.FC = () => {
  const { setCurrentGame, playerName } = usePlatform();
  const { joinRoom, error, isConnecting } = usePokerGame();
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleQuickJoin = async () => {
    setIsJoining(true);
    try {
      await joinRoom(playerName);
    } catch (error) {
      console.error('Failed to join room:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinWithCode = async () => {
    if (!roomCode.trim()) return;
    
    setIsJoining(true);
    try {
      await joinRoom(playerName, roomCode.trim());
    } catch (error) {
      console.error('Failed to join room with code:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const isLoading = isConnecting || isJoining;

  return (
    <div className="h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm p-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => setCurrentGame(null)}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
          >
            <Home size={20} />
            Back to Platform
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">🃏 Poker Lobby</h1>
            <p className="text-blue-200">Join a table and start playing!</p>
          </div>
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎰</div>
            <h2 className="text-3xl font-bold mb-2">Welcome to Texas Hold'em</h2>
            <p className="text-xl text-blue-200 mb-6">
              Join other players for exciting poker action!
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-600/20 border border-red-600 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-red-200">
                <span className="text-xl">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Join Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Quick Join */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-bold mb-3">Quick Join</h3>
                <p className="text-blue-200 mb-6">
                  Jump into the first available table instantly
                </p>
                <button
                  onClick={handleQuickJoin}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 px-6 py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Joining...
                    </>
                  ) : (
                    <>
                      <Play size={20} />
                      Quick Join
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Join with Code */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-3">Join with Code</h3>
                <p className="text-blue-200 mb-6">
                  Enter a room code to join a specific table
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    placeholder="Enter room code"
                    className="w-full px-4 py-3 rounded-lg bg-black/30 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleJoinWithCode}
                    disabled={isLoading || !roomCode.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Joining...
                      </>
                    ) : (
                      <>
                        <Users size={20} />
                        Join Room
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Game Rules */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Game Rules
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-bold mb-2">Basic Rules:</h4>
                <ul className="space-y-1 text-blue-200">
                  <li>• Each player gets 2 hole cards</li>
                  <li>• 5 community cards are dealt</li>
                  <li>• Make the best 5-card hand</li>
                  <li>• Win the pot with the best hand</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-2">Betting Rounds:</h4>
                <ul className="space-y-1 text-blue-200">
                  <li>• Pre-flop (after hole cards)</li>
                  <li>• Flop (first 3 community cards)</li>
                  <li>• Turn (4th community card)</li>
                  <li>• River (5th community card)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Game Features */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-blue-600/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock size={24} />
              </div>
              <div className="text-sm font-medium">Real-time</div>
              <div className="text-xs text-blue-200">Live multiplayer action</div>
            </div>
            <div className="text-center">
              <div className="bg-green-600/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shuffle size={24} />
              </div>
              <div className="text-sm font-medium">Fair Play</div>
              <div className="text-xs text-blue-200">Provably fair shuffling</div>
            </div>
            <div className="text-center">
              <div className="bg-yellow-600/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Coins size={24} />
              </div>
              <div className="text-sm font-medium">Virtual Chips</div>
              <div className="text-xs text-blue-200">Play money games</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};