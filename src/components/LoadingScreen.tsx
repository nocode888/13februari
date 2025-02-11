import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  isTransparent?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...',
  isTransparent = false
}) => {
  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isTransparent ? 'bg-white/80' : 'bg-gradient-to-br from-gray-50 to-gray-100'
    }`}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin">
            <div className="absolute top-0 right-0 w-4 h-4 bg-blue-600 rounded-full" />
          </div>
        </div>
        <p className="text-gray-600 animate-pulse">{message}</p>
      </div>
    </div>
  );
};