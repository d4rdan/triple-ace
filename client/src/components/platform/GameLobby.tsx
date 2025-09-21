// /client/src/components/platform/GameLobby.tsx
import React, {useState} from 'react';
import {Play, Settings, Users, Coins, Volume2, VolumeX, Monitor, Moon} from 'lucide-react';
import {usePlatform} from './PlatformProvider';

interface GameInfo {
    id: string;
    name: string;
    description: string;
    icon: string;
    minBet?: number;
    maxPlayers?: number;
    type: 'casino' | 'multiplayer';
    status: 'available' | 'maintenance' | 'coming-soon';
}

const games: GameInfo[] = [
    {
        id: 'roulette',
        name: 'European Roulette',
        description: 'Classic casino roulette with 37 numbers. Place your bets and spin the wheel!',
        icon: '🎰',
        minBet: 0.1,
        type: 'casino',
        status: 'available'
    },
    {
        id: 'poker',
        name: 'Texas Hold\'em Poker',
        description: 'Play poker against other players in real-time multiplayer rooms.',
        icon: '🃏',
        maxPlayers: 8,
        type: 'multiplayer',
        status: 'available'
    },
    {
        id: 'blackjack',
        name: 'BlackJack',
        description: 'Play BlackJack against a Computer.',
        icon: '♠️',
        maxPlayers: 8,
        type: 'casino',
        status: 'available'
    },

];

export const GameLobby: React.FC = () => {
    const {
        setCurrentGame,
        playerBalance,
        playerName,
        setPlayerName,
        soundEnabled,
        setSoundEnabled,
        theme,
        setTheme,
        isOnline
    } = usePlatform();

    const [showSettings, setShowSettings] = useState(false);
    const [newPlayerName, setNewPlayerName] = useState(playerName);

    const handleGameSelect = (gameId: string) => {
        const game = games.find(g => g.id === gameId);
        if (game?.status === 'available') {
            if (gameId === 'blackjack') {
                // Open blackjack.html in same tab
                window.location.href = '/blackjack.html';
                // OR open in new tab:
                // window.open('/blackjack.html', '_blank');
            } else {
                setCurrentGame(gameId);
            }
        }
    };

    const handleSaveSettings = () => {
        setPlayerName(newPlayerName);
        setShowSettings(false);
    };

    const getStatusBadge = (status: GameInfo['status']) => {
        switch (status) {
            case 'available':
                return <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">Available</span>;
            case 'maintenance':
                return <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">Maintenance</span>;
            case 'coming-soon':
                return <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">Coming Soon</span>;
            default:
                return null;
        }
    };

    return (
        <div
            className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900' : 'bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100'} text-white transition-all duration-300`}>
            {/* Header */}
            <div className="bg-black/30 backdrop-blur-sm p-6">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                            🎮 Gaming Platform
                        </h1>
                        <p className="text-xl opacity-80">Choose your game and start playing!</p>
                        {!isOnline && (
                            <div className="mt-2 text-red-400 text-sm">⚠️ You're offline - some features may be
                                limited</div>
                        )}
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg">
                            <Users size={20}/>
                            <span>{playerName}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg">
                            <Coins size={20} className="text-yellow-400"/>
                            <span className="font-bold">${playerBalance.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="bg-black/30 p-2 rounded-lg hover:bg-black/50 transition-colors"
                        >
                            <Settings size={20}/>
                        </button>
                    </div>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="bg-black/50 backdrop-blur-sm p-6 border-b border-white/10">
                    <div className="max-w-6xl mx-auto">
                        <h3 className="text-xl font-bold mb-4">Settings</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium">Player Name</label>
                                <input
                                    type="text"
                                    value={newPlayerName}
                                    onChange={(e) => setNewPlayerName(e.target.value)}
                                    className="w-full px-3 py-2 rounded bg-black/30 border border-gray-600 text-white placeholder-gray-400"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium">Sound</label>
                                <button
                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                                        soundEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                                    }`}
                                >
                                    {soundEnabled ? <Volume2 size={18}/> : <VolumeX size={18}/>}
                                    {soundEnabled ? 'Enabled' : 'Disabled'}
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium">Theme</label>
                                <button
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className="flex items-center gap-2 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 transition-colors"
                                >
                                    {theme === 'dark' ? <Moon size={18}/> : <Monitor size={18}/>}
                                    {theme === 'dark' ? 'Dark' : 'Light'}
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleSaveSettings}
                                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-medium transition-colors"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={() => {
                                    setNewPlayerName(playerName);
                                    setShowSettings(false);
                                }}
                                className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Game Selection */}
            <div className="max-w-6xl mx-auto p-6">
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {games.map(game => (
                        <div
                            key={game.id}
                            className={`bg-black/20 backdrop-blur-sm rounded-xl p-8 border border-white/10 transition-all duration-300 transform hover:scale-105 ${
                                game.status === 'available'
                                    ? 'hover:bg-black/30 cursor-pointer'
                                    : 'opacity-60 cursor-not-allowed'
                            }`}
                            onClick={() => handleGameSelect(game.id)}
                        >
                            <div className="text-center">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-6xl">{game.icon}</div>
                                    {getStatusBadge(game.status)}
                                </div>

                                <h3 className="text-2xl font-bold mb-3">{game.name}</h3>
                                <p className="text-lg opacity-80 mb-4 leading-relaxed">{game.description}</p>

                                <div className="flex justify-center gap-4 mb-6 text-sm">
                                    {game.minBet && (
                                        <span className="bg-blue-500/20 px-3 py-1 rounded-full">
                      Min Bet: ${game.minBet}
                    </span>
                                    )}
                                    {game.maxPlayers && (
                                        <span className="bg-purple-500/20 px-3 py-1 rounded-full">
                      Max Players: {game.maxPlayers}
                    </span>
                                    )}
                                    <span className={`px-3 py-1 rounded-full ${
                                        game.type === 'casino' ? 'bg-green-500/20' : 'bg-orange-500/20'
                                    }`}>
                    {game.type === 'casino' ? 'Solo Play' : 'Multiplayer'}
                  </span>
                                </div>

                                <button
                                    disabled={game.status !== 'available'}
                                    className={`font-bold text-lg flex items-center gap-2 mx-auto transition-all px-8 py-3 rounded-lg ${
                                        game.status === 'available'
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                                            : 'bg-gray-600 cursor-not-allowed'
                                    }`}
                                >
                                    <Play size={20}/>
                                    {game.status === 'available' ? 'Play Now' : 'Unavailable'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Platform Features */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-8">Platform Features</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6">
                            <div className="text-3xl mb-3">⚡</div>
                            <h3 className="text-xl font-bold mb-2">Instant Play</h3>
                            <p className="opacity-80">No downloads required. Play directly in your browser with
                                optimized performance.</p>
                        </div>
                        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6">
                            <div className="text-3xl mb-3">🔒</div>
                            <h3 className="text-xl font-bold mb-2">Fair Gaming</h3>
                            <p className="opacity-80">Provably fair algorithms ensure transparent and trustworthy
                                gameplay.</p>
                        </div>
                        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6">
                            <div className="text-3xl mb-3">🎯</div>
                            <h3 className="text-xl font-bold mb-2">Multiple Games</h3>
                            <p className="opacity-80">Choose from roulette, poker, blackjack, and more exciting games coming
                                soon.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};