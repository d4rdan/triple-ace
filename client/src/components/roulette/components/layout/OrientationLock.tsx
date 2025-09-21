// src/components/roulette/components/layout/OrientationLock.tsx

import React from 'react';

interface OrientationLockProps {
  children: React.ReactNode;
  isLandscape: boolean;
  isMobile: boolean;
}

export const OrientationLock: React.FC<OrientationLockProps> = ({
  children,
  isLandscape,
  isMobile,
}) => {
  // Show rotation message if on mobile and NOT in landscape
  if (isMobile && !isLandscape) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center text-white p-8">
          <div className="text-6xl mb-4 animate-bounce">📱</div>
          <h2 className="text-2xl font-bold mb-2">Please Rotate Your Device</h2>
          <p className="text-lg opacity-75">This game is best played in landscape mode</p>
          <div className="mt-4 text-4xl">↻</div>
        </div>
      </div>
    );
  }

  // Show game content
  return <>{children}</>;
};