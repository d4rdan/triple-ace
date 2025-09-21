// /client/src/components/roulette/hooks/useOrientation.tsx
import { useState, useEffect } from 'react';

interface OrientationInfo {
  isLandscape: boolean;
  isMobile: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
}

export const useOrientation = (): OrientationInfo => {
  const [orientation, setOrientation] = useState<OrientationInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        isLandscape: false,
        isMobile: false,
        screenWidth: 1024,
        screenHeight: 768,
        orientation: 'landscape'
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isLandscape = width > height;
    const isMobile = width < 768;

    return {
      isLandscape,
      isMobile,
      screenWidth: width,
      screenHeight: height,
      orientation: isLandscape ? 'landscape' : 'portrait'
    };
  });

  useEffect(() => {
    const updateOrientation = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isLandscape = width > height;
      const isMobile = width < 768;

      setOrientation({
        isLandscape,
        isMobile,
        screenWidth: width,
        screenHeight: height,
        orientation: isLandscape ? 'landscape' : 'portrait'
      });
    };

    // Update on resize
    window.addEventListener('resize', updateOrientation);
    
    // Update on orientation change (mobile)
    window.addEventListener('orientationchange', () => {
      // Small delay to ensure the browser has finished the orientation change
      setTimeout(updateOrientation, 100);
    });

    // Initial update
    updateOrientation();

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientation;
};