'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { toast } from 'sonner';

interface PollingConfig {
  interval: number;
  enabled?: boolean;
  immediate?: boolean;
  showNotifications?: boolean;
  onUpdate?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

interface UseSmartPollingReturn {
  startPolling: () => void;
  stopPolling: () => void;
  isPolling: boolean;
  lastUpdate: Date | null;
  error: Error | null;
}

export function useSmartPolling(
  fetchFunction: () => Promise<unknown>,
  config: PollingConfig
): UseSmartPollingReturn {
  const {
    interval,
    enabled = true,
    immediate = false,
    showNotifications = false,
    onUpdate,
    onError,
  } = config;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const previousDataRef = useRef<unknown>(null);

  const executePoll = useCallback(async () => {
    try {
      const data = await fetchFunction();
      setError(null);

      // Check if data has changed
      if (
        previousDataRef.current &&
        JSON.stringify(data) !== JSON.stringify(previousDataRef.current)
      ) {
        setLastUpdate(new Date());
        onUpdate?.(data);

        if (showNotifications) {
          toast.success('New updates available', {
            description: 'The page has been refreshed with new data',
            duration: 3000,
          });
        }
      }

      previousDataRef.current = data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);

      if (showNotifications) {
        toast.error('Failed to check for updates', {
          description: error.message,
          duration: 5000,
        });
      }
    }
  }, [fetchFunction, onUpdate, onError, showNotifications]);

  const startPolling = useCallback(() => {
    if (isPollingRef.current) return;

    isPollingRef.current = true;

    if (immediate) {
      executePoll();
    }

    intervalRef.current = setInterval(() => {
      executePoll();
    }, interval);
  }, [executePoll, interval, immediate]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isPollingRef.current = false;
  }, []);

  useEffect(() => {
    if (enabled) {
      if (immediate) {
        startPolling();
      } else {
        // Start polling after the initial interval
        intervalRef.current = setInterval(() => {
          executePoll();
        }, interval);
        isPollingRef.current = true;
      }
    }

    return () => {
      stopPolling();
    };
  }, [enabled, immediate, startPolling, stopPolling, executePoll, interval]);

  return {
    startPolling,
    stopPolling,
    isPolling: isPollingRef.current,
    lastUpdate,
    error,
  };
}
