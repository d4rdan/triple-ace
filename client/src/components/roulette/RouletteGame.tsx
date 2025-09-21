// src/components/roulette/RouletteGame.tsx

'use client';

import React from 'react';
import { GameProvider } from './context/GameContext';
import { GameLayout } from './components/layout/GameLayout';
// Import the wheel styles


const RouletteGame: React.FC = () => {
  return (
    <GameProvider>
      <GameLayout />
    </GameProvider>
  );
};

export default RouletteGame;