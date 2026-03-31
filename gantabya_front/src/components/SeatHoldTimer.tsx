import React from 'react';
import { FaClock } from 'react-icons/fa';

interface SeatHoldTimerProps {
  countdown: number;
  isWarning: boolean;
  isCritical: boolean;
  formatTime: (seconds: number) => string;
}

export const SeatHoldTimer: React.FC<SeatHoldTimerProps> = ({ 
  countdown, 
  isWarning, 
  isCritical, 
  formatTime 
}) => {
  if (countdown === 0) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
      isCritical 
        ? 'bg-red-100 text-red-700' 
        : isWarning 
        ? 'bg-yellow-100 text-yellow-700' 
        : 'bg-blue-100 text-blue-700'
    }`}>
      <FaClock className={isCritical ? 'animate-pulse' : ''} />
      <span className="font-semibold">
        Seats reserved for: {formatTime(countdown)}
      </span>
    </div>
  );
};
