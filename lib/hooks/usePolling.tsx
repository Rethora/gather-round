'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions {
  interval: number; // milliseconds
  enabled?: boolean;
  onError?: (error: Error) => void;
  immediate?: boolean; // whether to run immediately on mount
}

interface UsePollingReturn {
  startPolling: () => void;
  stopPolling: () => void;
  isPolling: boolean;
}

export function usePolling(
  callback: () => Promise<void> | void,
  options: UsePollingOptions
): UsePollingReturn {
  const { interval, enabled = true, onError, immediate = false } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  const executeCallback = useCallback(async () => {
    try {
      await callback();
    } catch (error) {
      onError?.(error as Error);
    }
  }, [callback, onError]);

  const startPolling = useCallback(() => {
    if (isPollingRef.current) return;

    isPollingRef.current = true;
    executeCallback();

    intervalRef.current = setInterval(() => {
      executeCallback();
    }, interval);
  }, [executeCallback, interval]);

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
          executeCallback();
        }, interval);
        isPollingRef.current = true;
      }
    }

    return () => {
      stopPolling();
    };
  }, [
    enabled,
    immediate,
    startPolling,
    stopPolling,
    executeCallback,
    interval,
  ]);

  return {
    startPolling,
    stopPolling,
    isPolling: isPollingRef.current,
  };
}
