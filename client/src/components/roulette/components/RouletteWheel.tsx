// /client/src/components/roulette/components/RouletteWheel.tsx - Fixed ball spinning and winning number
import React, { useState, useEffect } from 'react';

interface RouletteWheelProps {
  isSpinning: boolean;
  winningNumber: number | null;
  showResult: boolean;
}

const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export const RouletteWheel: React.FC<RouletteWheelProps> = ({
  isSpinning,
  winningNumber,
  showResult
}) => {
  const [rotation, setRotation] = useState(0);
  const [ballRotation, setBallRotation] = useState(0);

  useEffect(() => {
    if (isSpinning && winningNumber !== null) {
      // Calculate target rotation based on winning number
      const numberIndex = WHEEL_NUMBERS.indexOf(winningNumber);
      const segmentAngle = 360 / 37; // 37 segments (0-36)
      
      // Calculate the angle where this number should stop at the top (12 o'clock position)
      // We want the number to align with the pointer at the top
      const targetAngle = numberIndex * segmentAngle;
      
      // Add multiple full rotations for dramatic effect
      const baseRotations = 1800; // 5 full rotations
      const randomExtra = Math.random() * 360; // Random extra rotation
      const wheelFinalRotation = baseRotations + randomExtra + (360 - targetAngle);
      
      // Ball spins in opposite direction and faster
      const ballBaseRotations = 2160; // 6 full rotations (opposite direction)
      const ballFinalRotation = -ballBaseRotations - randomExtra + targetAngle;
      
      setRotation(wheelFinalRotation);
      setBallRotation(ballFinalRotation);
      
      console.log('[RouletteWheel] Spinning to number:', winningNumber, 'at index:', numberIndex);
      console.log('[RouletteWheel] Target angle:', targetAngle);
      console.log('[RouletteWheel] Wheel rotation:', wheelFinalRotation);
      console.log('[RouletteWheel] Ball rotation:', ballFinalRotation);
    }
  }, [isSpinning, winningNumber]);

  const getNumberColor = (num: number): string => {
    if (num === 0) return '#10b981'; // green
    return RED_NUMBERS.includes(num) ? '#dc2626' : '#1f2937'; // red or dark gray
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Wheel Container */}
      <div className="relative w-64 h-64 md:w-80 md:h-80">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-8 border-yellow-600 bg-gradient-to-br from-yellow-700 to-yellow-800 shadow-2xl">
          {/* Wheel Segments */}
          <div 
            className={`w-full h-full rounded-full relative overflow-hidden transition-transform duration-[3000ms] ease-out ${isSpinning ? '' : 'duration-0'}`}
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {WHEEL_NUMBERS.map((number, index) => {
              const angle = (360 / 37) * index;
              const color = getNumberColor(number);
              
              return (
                <div
                  key={number}
                  className="absolute w-full h-full"
                  style={{
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  {/* Number segment */}
                  <div
                    className="absolute w-0 h-0"
                    style={{
                      top: '8px',
                      left: '50%',
                      borderLeft: '14px solid transparent',
                      borderRight: '14px solid transparent',
                      borderTop: `45px solid ${color}`,
                      transform: 'translateX(-50%)',
                    }}
                  />
                  {/* Number text */}
                  <div
                    className="absolute text-white text-xs font-bold"
                    style={{
                      top: '18px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    }}
                  >
                    {number}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Center Hub */}
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-4 border-yellow-300 shadow-lg">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
              <div className="w-6 h-6 bg-yellow-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Ball - Now properly spinning */}
        <div 
          className={`absolute w-4 h-4 transition-transform duration-[3000ms] ease-out ${isSpinning ? '' : 'duration-0'}`}
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) rotate(${ballRotation}deg)`,
            transformOrigin: 'center center',
          }}
        >
          {/* Ball positioned on the wheel rim */}
          <div 
            className="absolute w-4 h-4 bg-white rounded-full shadow-lg"
            style={{
              transform: 'translateY(-105px)', // Position on wheel rim
            }}
          >
            {/* Ball inner gradient for 3D effect */}
            <div className="w-full h-full rounded-full bg-gradient-to-br from-white to-gray-300 shadow-inner border border-gray-200"></div>
          </div>
        </div>

        {/* Pointer at top */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1">
          <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-yellow-400 drop-shadow-lg"></div>
        </div>

        {/* Wheel rim decoration */}
        <div className="absolute inset-1 rounded-full border-2 border-yellow-500 opacity-50"></div>
      </div>

      {/* Status Display */}
      <div className="mt-6 text-center">
        {isSpinning && (
          <div className="text-xl font-bold text-yellow-400 animate-pulse">
            🎰 Spinning...
          </div>
        )}
        
        {!isSpinning && !showResult && (
          <div className="text-lg text-gray-300">
            💰 Place your bets and spin!
          </div>
        )}

        {showResult && winningNumber !== null && (
          <div className="space-y-3 animate-bounce">
            <div className="text-2xl font-bold text-yellow-400">
              🏆 Winning Number:
            </div>
            <div 
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-white font-bold text-2xl border-4 shadow-2xl ${
                winningNumber === 0 
                  ? 'bg-green-600 border-green-400 shadow-green-400/50'
                  : RED_NUMBERS.includes(winningNumber)
                    ? 'bg-red-600 border-red-400 shadow-red-400/50'
                    : 'bg-gray-800 border-gray-600 shadow-gray-400/50'
              }`}
            >
              {winningNumber}
            </div>
            <div className="text-sm text-gray-300">
              {winningNumber === 0 
                ? 'Zero (Green)' 
                : RED_NUMBERS.includes(winningNumber) 
                  ? 'Red' 
                  : 'Black'
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};