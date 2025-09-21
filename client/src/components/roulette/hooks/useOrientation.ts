// src/components/roulette/hooks/useOrientation.ts

import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../utils/constants';

interface OrientationState {
  isLandscape: boolean;
  isMobile: boolean;
  screenWidth: number;
  screenHeight: number;
}

export const useOrientation = (): OrientationState => {
  const [state, setState] = useState<OrientationState>({
    isLandscape: false,
    isMobile: false,
    screenWidth: 0,
    screenHeight: 0,
  });

  useEffect(() => {
    const checkOrientation = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isLandscape = width > height;
      const isMobile = width < BREAKPOINTS.desktop; // Changed to use desktop breakpoint

      setState({
        isLandscape,
        isMobile,
        screenWidth: width,
        screenHeight: height,
      });
    };

    // Initial check
    checkOrientation();

    // Listen for orientation changes
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return state;
};