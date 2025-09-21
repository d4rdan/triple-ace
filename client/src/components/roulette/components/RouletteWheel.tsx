// /client/src/components/roulette/components/RouletteWheel.tsx
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
    if (isSpinning) {
      // Calculate target rotation based on winning number
      const numberIndex = WHEEL_NUMBERS.indexOf(winningNumber || 0);
      const segmentAngle = 360 / 37;
      const targetAngle = numberIndex * segmentAngle;
      
      // Add multiple full rotations for effect
      const fullRotations = 1800 + Math.random() * 720; // 5-7 full rotations
      const finalRotation = fullRotations + (360 - targetAngle);
      
      setRotation(finalRotation);
      setBallRotation(finalRotation * 1.1); // Ball spins slightly faster
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
                  <div
                    className="absolute w-0 h-0"
                    style={{
                      top: '10px',
                      left: '50%',
                      borderLeft: '12px solid transparent',
                      borderRight: '12px solid transparent',
                      borderTop: `40px solid ${color}`,
                      transform: 'translateX(-50%)',
                    }}
                  />
                  <div
                    className="absolute text-white text-xs font-bold"
                    style={{
                      top: '15px',
                      left: '50%',
                      transform: 'translateX(-50%)',
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

        {/* Ball */}
        <div 
          className={`absolute w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-[3000ms] ease-out ${isSpinning ? '' : 'duration-0'}`}
          style={{
            top: '20px',
            left: 'calc(50% - 8px)',
            transform: `rotate(${ballRotation}deg) translateY(110px)`,
          }}
        />

        {/* Pointer */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400"></div>
        </div>
      </div>

      {/* Status Display */}
      <div className="mt-6 text-center">
        {isSpinning && (
          <div className="text-xl font-bold text-yellow-400 animate-pulse">
            Spinning...
          </div>
        )}
        
        {!isSpinning && !showResult && (
          <div className="text-lg text-gray-300">
            Place your bets and spin!
          </div>
        )}
      </div>
    </div>
  );
};