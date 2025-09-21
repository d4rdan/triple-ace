// /client/src/pages/index.tsx - Fixed dynamic imports
import React, { useState, useEffect } from 'react';
import { PlatformProvider, usePlatform } from '../components/platform/PlatformProvider';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamically import components to avoid SSR issues
const GameLobby = dynamic(() => import('../components/platform/GameLobby').then(mod => ({ default: mod.GameLobby })), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center text-white">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <div className="text-xl">Loading Game Platform...</div>
    </div>
  </div>
});

// ✅ Fixed: RouletteGame uses default export, no destructuring needed
const RouletteGame = dynamic(() => import('../components/roulette/RouletteGame'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center text-white">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <div className="text-xl">Loading Roulette...</div>
    </div>
  </div>
});

const PokerGame = dynamic(() => import('../components/poker/PokerGame').then(mod => ({ default: mod.PokerGame })), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center text-white">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <div className="text-xl">Loading Poker...</div>
    </div>
  </div>
});

const AppContent: React.FC = () => {
  const { currentGame } = usePlatform();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl">Initializing Platform...</div>
        </div>
      </div>
    );
  }

  // Render current game or lobby
  switch (currentGame) {
    case 'roulette':
      return <RouletteGame />;
    case 'poker':
      return <PokerGame />;
    default:
      return <GameLobby />;
  }
};

export default function Home() {
  return (
    <>
      <Head>
        <title>Gaming Platform</title>
        <meta name="description" content="Multi-game platform with roulette and poker" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PlatformProvider>
        <div className="min-h-screen">
          <AppContent />
        </div>
      </PlatformProvider>
    </>
  );
}