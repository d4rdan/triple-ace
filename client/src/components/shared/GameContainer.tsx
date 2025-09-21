// /client/src/components/shared/GameContainer.tsx
import React, { useRef, useEffect, useState } from 'react';

interface GameContainerProps {
  children: React.ReactNode;
  className?: string;
  enableFullscreen?: boolean;
  maintainAspectRatio?: boolean;
  targetAspectRatio?: number; // width/height ratio (e.g., 16/9 = 1.78)
}

export const GameContainer: React.FC<GameContainerProps> = ({
  children,
  className = '',
  enableFullscreen = true,
  maintainAspectRatio = true,
  targetAspectRatio = 16/9
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, scale: 1 });

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!(document.fullscreenElement || 
           (document as any).webkitFullscreenElement || 
           (document as any).mozFullScreenElement)
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Calculate optimal scaling
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      
      let scale = 1;
      let width = rect.width;
      let height = rect.height;

      if (maintainAspectRatio) {
        const containerAspectRatio = width / height;
        
        if (containerAspectRatio > targetAspectRatio) {
          // Container is wider than target - scale by height
          scale = height / (width / targetAspectRatio);
          width = height * targetAspectRatio;
        } else {
          // Container is taller than target - scale by width
          scale = width / (height * targetAspectRatio);
          height = width / targetAspectRatio;
        }
        
        // Ensure scale doesn't exceed container bounds
        scale = Math.min(scale, rect.width / width, rect.height / height);
      }

      setDimensions({ width, height, scale });
    };

    // Initial calculation
    updateDimensions();

    // Update on resize
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Update on window resize and orientation change
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', () => {
      setTimeout(updateDimensions, 100);
    });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, [maintainAspectRatio, targetAspectRatio]);

  const toggleFullscreen = async () => {
    if (!containerRef.current || !enableFullscreen) return;

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any).mozRequestFullScreen) {
          await (containerRef.current as any).mozRequestFullScreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        }
      }
    } catch (error) {
      console.warn('Fullscreen operation failed:', error);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{
        background: isFullscreen ? '#000' : 'transparent',
      }}
    >
      {/* Game Content */}
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          transform: maintainAspectRatio ? `scale(${dimensions.scale})` : 'none',
          transformOrigin: 'center',
        }}
      >
        <div
          style={{
            width: maintainAspectRatio ? `${dimensions.width}px` : '100%',
            height: maintainAspectRatio ? `${dimensions.height}px` : '100%',
          }}
        >
          {children}
        </div>
      </div>

      {/* Fullscreen Toggle Button */}
      {enableFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zM16 4a1 1 0 00-1-1h-4a1 1 0 100 2h1.586l-2.293 2.293a1 1 0 101.414 1.414L14 6.414V8a1 1 0 102 0V4zM3 16a1 1 0 001 1h4a1 1 0 000-2H6.414l2.293-2.293a1 1 0 00-1.414-1.414L5 13.586V12a1 1 0 00-2 0v4zM16 16a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L14 13.586V12a1 1 0 112 0v4z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 000 2h1.586l2.293 2.293a1 1 0 001.414-1.414L6 4.586V3a1 1 0 00-2 0v1zM16 4a1 1 0 100 2h-1.586l-2.293 2.293a1 1 0 11-1.414-1.414L14 4.586V3a1 1 0 112 0v1zM3 16a1 1 0 100-2h1.586l2.293-2.293a1 1 0 11-1.414-1.414L6 15.586V17a1 1 0 002 0v-1zM16 16a1 1 0 000-2h-1.586l-2.293-2.293a1 1 0 10-1.414 1.414L14 15.586V17a1 1 0 102 0v-1z"/>
            </svg>
          )}
        </button>
      )}

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white p-2 rounded text-xs z-50">
          <div>Size: {dimensions.width.toFixed(0)}×{dimensions.height.toFixed(0)}</div>
          <div>Scale: {dimensions.scale.toFixed(2)}</div>
          <div>Aspect: {(dimensions.width / dimensions.height).toFixed(2)}</div>
          <div>Target: {targetAspectRatio.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
};