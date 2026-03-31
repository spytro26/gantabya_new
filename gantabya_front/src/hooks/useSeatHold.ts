import { useState, useEffect, useCallback } from 'react';

interface SeatHoldOptions {
  tripId: string;
  fromStopIndex: number;
  toStopIndex: number;
  isReturnTrip: boolean;
  onExpired?: () => void;
}

interface HoldSeatsParams {
  fromStopIndex: number;
  toStopIndex: number;
  isReturnTrip: boolean;
}

interface HoldSeatsResult {
  success: boolean;
  holdId?: string;
  error?: string;
}

interface SeatHold {
  seatIds: string[];
  expiresAt: Date | null;
  remainingSeconds: number;
}

export const useSeatHold = (options: SeatHoldOptions) => {
  const { onExpired } = options;
  
  const [holdStatus, setHoldStatus] = useState<SeatHold>({
    seatIds: [],
    expiresAt: null,
    remainingSeconds: 0,
  });
  const [holdId, setHoldId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [isHolding, setIsHolding] = useState<boolean>(false);

  const isWarning = countdown > 0 && countdown <= 120; // Last 2 minutes
  const isCritical = countdown > 0 && countdown <= 60; // Last 1 minute

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const holdSeats = useCallback(async (
    seatIds: string[], 
    _params: HoldSeatsParams
  ): Promise<HoldSeatsResult> => {
    try {
      setIsHolding(true);
      
      // Placeholder - implement actual API call to hold seats
      // For now, just set a 5-minute expiry
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      const newHoldId = `hold-${Date.now()}`;
      
      setHoldId(newHoldId);
      setHoldStatus({
        seatIds,
        expiresAt,
        remainingSeconds: 300,
      });
      setCountdown(300);
      
      return {
        success: true,
        holdId: newHoldId,
      };
    } catch (error: any) {
      setIsHolding(false);
      return {
        success: false,
        error: error.message || 'Failed to hold seats',
      };
    } finally {
      setIsHolding(false);
    }
  }, []);

  const releaseSeats = useCallback(() => {
    setHoldId(null);
    setHoldStatus({
      seatIds: [],
      expiresAt: null,
      remainingSeconds: 0,
    });
    setCountdown(0);
    setIsHolding(false);
  }, []);

  const checkHoldStatus = useCallback(async () => {
    // Placeholder - implement actual API call to check hold status
    return holdStatus;
  }, [holdStatus]);

  useEffect(() => {
    if (!holdStatus.expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(holdStatus.expiresAt!).getTime();
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000));

      setCountdown(remaining);

      if (remaining === 0) {
        releaseSeats();
        if (onExpired) {
          onExpired();
        }
      } else {
        setHoldStatus(prev => ({ ...prev, remainingSeconds: remaining }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdStatus.expiresAt, releaseSeats, onExpired]);

  return {
    holdStatus,
    isHolding,
    holdId,
    countdown,
    isWarning,
    isCritical,
    formatTime,
    holdSeats,
    releaseSeats,
    checkHoldStatus,
  };
};
