// client/components/ui/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="animate-spin text-4xl">🎰</div>
      <div className="text-gray-300">{message}</div>
    </div>
  );
};

export default LoadingSpinner;