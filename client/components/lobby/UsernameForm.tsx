// client/components/lobby/UsernameForm.tsx
import React, { useState } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface UsernameFormProps {
  onSubmit: (username: string) => void;
  isLoading: boolean;
  isConnected: boolean;
}

const UsernameForm: React.FC<UsernameFormProps> = ({ onSubmit, isLoading, isConnected }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && !isLoading) {
      onSubmit(username.trim());
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Joining casino..." />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 
                   focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          maxLength={20}
          required
        />
      </div>
      <button
        type="submit"
        disabled={!isConnected || !username.trim() || isLoading}
        className="w-full p-3 bg-blue-600 text-white font-bold rounded-lg 
                 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors duration-200"
      >
        {isConnected ? 'Join Casino' : 'Connecting...'}
      </button>
    </form>
  );
};

export default UsernameForm;
