// src/components/roulette/components/game/RouletteWheel.tsx - Updated with improvements

import React, { useState, useEffect, useRef } from 'react';
import { WHEEL_NUMBERS, RED_NUMBERS } from '../../utils/constants';
import { useGame } from '../../context/GameContext';

interface RouletteWheelProps {
  isSpinning?: boolean;
  onSpinComplete?: (winningNumber: number) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export const RouletteWheel: React.FC<RouletteWheelProps> = ({
  isSpinning = false,
  onSpinComplete,
  isMobile = false,
  onClose,
}) => {
  const game = useGame();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [hasSpunForCurrentNumber, setHasSpunForCurrentNumber] = useState<number | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Animation constants
  const SLOT_ANGLE = 360 / 37; // Each slot is ~9.73 degrees
  const ANIMATION_DURATION = 4000; // 4 seconds
  const AUTO_CLOSE_DELAY = 3000; // 3 seconds after result shows

  // Get number color
  const getNumberColor = (num: number): string => {
    if (num === 0) return '#10b981'; // emerald-500
    return RED_NUMBERS.includes(num) ? '#dc2626' : '#374151'; // red-600 or gray-700
  };

  // Get responsive wheel size
  const getWheelSize = () => {
    const baseSize = isMobile ? 
      Math.min(window.innerWidth * 0.8, window.innerHeight * 0.6, 400) : 
      600;
    return Math.max(baseSize, 300); // Minimum 300px
  };

  const wheelSize = getWheelSize();

  // Calculate if player won and how much
  const getWinInfo = () => {
    if (game.winningNumber === null) return null;
    
    const totalWin = game.lastWin;
    const isWin = totalWin > 0;
    
    return {
      isWin,
      amount: totalWin,
      winningNumber: game.winningNumber
    };
  };

  // Auto-close modal after result is shown
  useEffect(() => {
    if (showResult && onClose) {
      autoCloseTimeoutRef.current = setTimeout(() => {
        setShowResult(false);
        onClose();
      }, AUTO_CLOSE_DELAY);
    }

    return () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
    };
  }, [showResult, onClose]);

  // Clear timeout when component unmounts or closes manually
  const handleManualClose = () => {
    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
    }
    setShowResult(false);
    onClose?.();
  };

  // Calculate final positions for accurate landing
  const calculateFinalPositions = (winningNumber: number) => {
    const winningIndex = WHEEL_NUMBERS.indexOf(winningNumber);
    
    if (winningIndex === -1) {
      console.error('❌ Invalid winning number:', winningNumber);
      return null;
    }

    // Random number of full rotations for visual effect
    const wheelSpins = Math.floor(3 + Math.random() * 3); // 3-5 full rotations
    const ballSpins = Math.floor(5 + Math.random() * 3);  // 5-7 full rotations

    // In a roulette wheel, index 0 is at the top (12 o'clock position)
    // Each slot is SLOT_ANGLE degrees wide
    const winningSlotStartAngle = winningIndex * SLOT_ANGLE;
    
    // To get the winning slot to the top (0°), we need to rotate the wheel
    // by the negative of the slot's current angle, plus full spins
    const wheelFinalRotation = (wheelSpins * 360) - winningSlotStartAngle;
    
    // Ball rotates counter-clockwise and ends at the top (0°)
    const ballFinalRotation = -(ballSpins * 360);
    
    return {
      wheelRotation: wheelFinalRotation,
      ballRotation: ballFinalRotation,
      winningIndex,
    };
  };

  // Start spinning animation
  const startSpin = async () => {
    if (!game.winningNumber || isAnimating) {
      return;
    }

    setIsAnimating(true);
    setShowResult(false);

    const positions = calculateFinalPositions(game.winningNumber);
    if (!positions) {
      setIsAnimating(false);
      return;
    }

    const wheelElement = wheelRef.current;
    const ballElement = ballRef.current;

    if (!wheelElement || !ballElement) {
      setIsAnimating(false);
      return;
    }

    // Reset positions without transition
    wheelElement.style.transition = 'none';
    ballElement.style.transition = 'none';
    wheelElement.style.transform = 'rotate(0deg)';
    ballElement.style.transform = 'rotate(0deg)';

    // Force reflow
    const _ = wheelElement.offsetHeight;

    // Apply smooth animations
    const easing = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
    
    wheelElement.style.transition = `transform ${ANIMATION_DURATION}ms ${easing}`;
    ballElement.style.transition = `transform ${ANIMATION_DURATION}ms ${easing}`;
    
    wheelElement.style.transform = `rotate(${positions.wheelRotation}deg)`;
    ballElement.style.transform = `rotate(${positions.ballRotation}deg)`;

    // Wait for animation to complete
    setTimeout(() => {
      setIsAnimating(false);
      
      // Show result after 1 second delay
      setTimeout(() => {
        setShowResult(true);
        onSpinComplete?.(game.winningNumber!);
      }, 1000);
    }, ANIMATION_DURATION);
  };

  // Trigger spin when game enters spinning phase - PREVENT DOUBLE SPINS
  useEffect(() => {
    if (
      game.phase === 'SPINNING' && 
      game.winningNumber !== null && 
      !isAnimating &&
      hasSpunForCurrentNumber !== game.winningNumber
    ) {
      setHasSpunForCurrentNumber(game.winningNumber);
      startSpin();
    }
    
    // Reset tracking when phase changes away from spinning
    if (game.phase !== 'SPINNING') {
      setHasSpunForCurrentNumber(null);
    }
  }, [game.phase, game.winningNumber, isAnimating, hasSpunForCurrentNumber]);

  const winInfo = getWinInfo();

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex items-center justify-center z-[1000] p-4">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1)_0%,transparent_70%)]" />
      
      {/* Close button */}
      {!isAnimating && onClose && (
        <button
          onClick={handleManualClose}
          className="absolute top-4 right-4 w-10 h-10 md:w-12 md:h-12 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-all z-10 backdrop-blur-sm text-sm md:text-xl"
        >
          ✕
        </button>
      )}

      {/* Left side - Game status */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
        <div className="bg-emerald-800/90 text-white px-3 py-2 md:px-6 md:py-3 rounded-xl backdrop-blur-sm shadow-lg">
          <div className="text-center">
            <div className="text-xs md:text-sm opacity-80">European Roulette</div>
            <div className="text-sm md:text-lg font-bold">
              {game.phase === 'SPINNING' ? 'Spinning...' : 
               game.phase === 'RESULTS' ? 'Results' : '⚡ Ready'}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Total Bet */}
      <div className="absolute top-4 right-4 md:top-6 md:right-16 z-10">
        <div className="bg-gray-800/90 text-white px-3 py-2 md:px-6 md:py-3 rounded-xl backdrop-blur-sm shadow-lg">
          <div className="text-center">
            <div className="text-xs md:text-sm opacity-80">Total Bet</div>
            <div className="text-sm md:text-xl font-bold text-yellow-400">{game.totalBet} coins</div>
          </div>
        </div>
      </div>

      {/* Main wheel container */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        {/* Wheel assembly */}
        <div 
          className="relative"
          style={{ 
            width: `${wheelSize}px`, 
            height: `${wheelSize}px`,
            maxWidth: '90vw',
            maxHeight: '90vh'
          }}
        >
          {/* Outer rim with luxury feel */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-2xl" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 shadow-inner" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900" />
          
          {/* Main wheel area */}
          <div className="absolute inset-6 rounded-full bg-gray-900 shadow-inner overflow-hidden">
            {/* Rotating wheel */}
            <div ref={wheelRef} className="absolute inset-0 w-full h-full">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <defs>
                  {/* Enhanced gradients */}
                  <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#dc2626" />
                    <stop offset="50%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#b91c1c" />
                  </linearGradient>
                  <linearGradient id="blackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4b5563" />
                    <stop offset="50%" stopColor="#374151" />
                    <stop offset="100%" stopColor="#1f2937" />
                  </linearGradient>
                  <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                  <radialGradient id="centerGradient">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="70%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </radialGradient>
                </defs>

                {/* Wheel segments */}
                {WHEEL_NUMBERS.map((number, index) => {
                  const startAngle = (index * SLOT_ANGLE - 90) * Math.PI / 180;
                  const endAngle = ((index + 1) * SLOT_ANGLE - 90) * Math.PI / 180;
                  
                  const innerRadius = 25;
                  const outerRadius = 95;
                  
                  // Calculate path points
                  const x1 = 100 + outerRadius * Math.cos(startAngle);
                  const y1 = 100 + outerRadius * Math.sin(startAngle);
                  const x2 = 100 + outerRadius * Math.cos(endAngle);
                  const y2 = 100 + outerRadius * Math.sin(endAngle);
                  const x3 = 100 + innerRadius * Math.cos(endAngle);
                  const y3 = 100 + innerRadius * Math.sin(endAngle);
                  const x4 = 100 + innerRadius * Math.cos(startAngle);
                  const y4 = 100 + innerRadius * Math.sin(startAngle);
                  
                  // Text position
                  const textAngle = startAngle + (SLOT_ANGLE * Math.PI / 180) / 2;
                  const textRadius = 68;
                  const textX = 100 + textRadius * Math.cos(textAngle);
                  const textY = 100 + textRadius * Math.sin(textAngle);
                  
                  // Get gradient
                  const gradient = number === 0 ? 'url(#greenGradient)' :
                                 RED_NUMBERS.includes(number) ? 'url(#redGradient)' : 'url(#blackGradient)';
                  
                  return (
                    <g key={`slot-${index}`}>
                      {/* Slot background */}
                      <path
                        d={`M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`}
                        fill={gradient}
                        stroke="#fbbf24"
                        strokeWidth="0.3"
                      />
                      
                      {/* Slot separators */}
                      <line
                        x1={x1} y1={y1}
                        x2={x4} y2={y4}
                        stroke="#fbbf24"
                        strokeWidth="0.5"
                        opacity="0.7"
                      />
                      
                      {/* Number text */}
                      <text
                        x={textX}
                        y={textY}
                        fill="white"
                        fontSize={isMobile ? "8" : "10"}
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${(index * SLOT_ANGLE) + 90}, ${textX}, ${textY})`}
                        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                      >
                        {number}
                      </text>
                    </g>
                  );
                })}

                {/* Center hub */}
                <circle cx="100" cy="100" r="23" fill="url(#centerGradient)" stroke="#92400e" strokeWidth="1.5" />
                <circle cx="100" cy="100" r="16" fill="none" stroke="#92400e" strokeWidth="1" opacity="0.6" />
                <text
                  x="100" y="100"
                  fill="#92400e"
                  fontSize={isMobile ? "12" : "16"}
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  ⚜️
                </text>
              </svg>
            </div>
          </div>

          {/* Ball track with glow */}
          <div className="absolute inset-8 rounded-full border-2 border-yellow-400/80 pointer-events-none" 
               style={{ boxShadow: '0 0 20px rgba(251, 191, 36, 0.3), inset 0 0 20px rgba(251, 191, 36, 0.1)' }} />

          {/* Ball */}
          <div className="absolute inset-10 pointer-events-none">
            <div ref={ballRef} className="relative w-full h-full">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ transform: 'translateX(-50%) translateY(-50%) translateX(15px)' }}>
                <div className="relative">
                  {/* Ball shadow/glow */}
                  <div className={`absolute inset-0 ${isMobile ? 'w-5 h-5' : 'w-7 h-7'} bg-white/20 rounded-full blur-sm`} />
                  {/* Main ball */}
                  <div className={`relative ${isMobile ? 'w-5 h-5' : 'w-7 h-7'} bg-gradient-to-br from-white via-gray-100 to-gray-300 rounded-full shadow-lg border border-gray-400`} />
                  {/* Ball highlight */}
                  <div className={`absolute top-1 left-1 ${isMobile ? 'w-2 h-2' : 'w-3 h-3'} bg-gradient-to-br from-white/80 to-transparent rounded-full`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Winning indicator pointer */}
        <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 md:w-6 md:h-6 bg-yellow-400 rotate-45 border-2 border-yellow-600 shadow-lg" />
            <div className="w-1 h-1 md:h-2 bg-yellow-400 -mt-1" />
          </div>
        </div>

        {/* Result display */}
        {showResult && game.winningNumber !== null && winInfo && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full backdrop-blur-sm cursor-pointer transition-all hover:bg-black/60"
            onClick={handleManualClose}
          >
            <div className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-4 border-yellow-500 shadow-2xl transform hover:scale-105 transition-transform
              ${isMobile 
                ? 'p-3 max-w-[280px] w-[90%] border-2' 
                : 'p-8 max-w-[90%]'
              }`}
            >
              <div className="text-center">
                <div className={`text-yellow-400 font-bold flex items-center justify-center gap-1 md:gap-2 
                  ${isMobile ? 'text-xs mb-2' : 'text-lg mb-4'}`}>
                  <span>WINNING NUMBER</span>
                </div>
                <div className={`font-bold rounded-xl shadow-inner transition-all
                  ${isMobile 
                    ? 'text-2xl px-3 py-1 mb-2' 
                    : 'text-7xl px-6 py-4 mb-4'
                  }
                  ${game.winningNumber === 0 
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white' 
                    : RED_NUMBERS.includes(game.winningNumber)
                    ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                    : 'bg-gradient-to-br from-gray-600 to-gray-700 text-white'
                  }`}>
                  {game.winningNumber}
                </div>
                
                {/* Win/Loss Result */}
                <div className={isMobile ? 'mb-2' : 'mb-4'}>
                  {winInfo.isWin ? (
                    <div className="text-center">
                      <div className={`text-green-400 font-bold flex items-center justify-center gap-1 md:gap-2
                        ${isMobile ? 'text-sm mb-1' : 'text-3xl mb-2'}`}>
                        <span>YOU WIN!</span>
                      </div>
                      <div className={`text-green-300 font-semibold
                        ${isMobile ? 'text-sm' : 'text-2xl'}`}>
                        +{winInfo.amount.toFixed(2)} coins
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className={`text-red-400 font-bold flex items-center justify-center gap-1 md:gap-2
                        ${isMobile ? 'text-sm mb-1' : 'text-3xl mb-2'}`}>
                        <span>NO WIN</span>
                      </div>
                      <div className={`text-red-300
                        ${isMobile ? 'text-xs' : 'text-lg'}`}>
                        Better luck next time!
                      </div>
                    </div>
                  )}
                </div>
                
                <div className={`text-gray-300 animate-pulse
                  ${isMobile ? 'text-[10px] leading-tight' : 'text-sm'}`}>
                  {isMobile 
                    ? `Auto-closes in ${Math.ceil(AUTO_CLOSE_DELAY / 1000)}s` 
                    : `Auto-closes in ${Math.ceil(AUTO_CLOSE_DELAY / 1000)}s or click to continue`
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ambient decorations */}
      <div className="absolute top-10 md:top-20 left-10 md:left-20 w-2 md:w-3 h-2 md:h-3 bg-yellow-400/30 rounded-full animate-pulse" />
      <div className="absolute top-16 md:top-32 right-16 md:right-32 w-1 md:w-2 h-1 md:h-2 bg-yellow-400/20 rounded-full animate-pulse delay-1000" />
      <div className="absolute bottom-10 md:bottom-20 left-16 md:left-32 w-2 md:w-4 h-2 md:h-4 bg-yellow-400/25 rounded-full animate-pulse delay-500" />
      <div className="absolute bottom-16 md:bottom-32 right-10 md:right-20 w-1 md:w-2 h-1 md:h-2 bg-yellow-400/15 rounded-full animate-pulse delay-2000" />
    </div>
  );
};