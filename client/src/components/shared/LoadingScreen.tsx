// /client/src/components/shared/LoadingScreen.tsx
import React from 'react';

interface LoadingScreenProps {
  message?: string;
  progress?: number; // 0-100
  showProgress?: boolean;
  variant?: 'spinner' | 'dots' | 'bars' | 'pulse';
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  progress,
  showProgress = false,
  variant = 'spinner',
  size = 'medium',
  fullScreen = true
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8';
      case 'large':
        return 'w-16 h-16';
      case 'medium':
      default:
        return 'w-12 h-12';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-xl';
      case 'medium':
      default:
        return 'text-lg';
    }
  };

  const renderLoadingAnimation = () => {
    const sizeClasses = getSizeClasses();

    switch (variant) {
      case 'spinner':
        return (
          <div className={`${sizeClasses} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
        );

      case 'dots':
        return (
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        );

      case 'bars':
        return (
          <div className="flex space-x-1 items-end">
            <div className="w-2 h-8 bg-blue-600 animate-pulse"></div>
            <div className="w-2 h-6 bg-blue-600 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-4 bg-blue-600 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-6 bg-blue-600 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-2 h-8 bg-blue-600 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        );

      case 'pulse':
        return (
          <div className={`${sizeClasses} bg-blue-600 rounded-full animate-pulse`}></div>
        );

      default:
        return (
          <div className={`${sizeClasses} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
        );
    }
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="text-center text-white">
        {/* Loading Animation */}
        <div className="flex justify-center mb-4">
          {renderLoadingAnimation()}
        </div>

        {/* Loading Message */}
        <div className={`${getTextSize()} font-medium mb-2`}>
          {message}
        </div>

        {/* Progress Bar */}
        {showProgress && typeof progress === 'number' && (
          <div className="w-64 mx-auto">
            <div className="flex justify-between text-sm text-gray-300 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Gaming-themed decorations */}
        {fullScreen && (
          <div className="mt-8 flex justify-center space-x-4 text-2xl opacity-60">
            <div className="animate-bounce" style={{ animationDelay: '0s' }}>🎮</div>
            <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>🎲</div>
            <div className="animate-bounce" style={{ animationDelay: '0.4s' }}>🃏</div>
            <div className="animate-bounce" style={{ animationDelay: '0.6s' }}>🎰</div>
          </div>
        )}
      </div>
    </div>
  );
};