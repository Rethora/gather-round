'use client';

import { usePolling } from '@/lib/hooks/usePolling';
import { usePollingContext } from '@/lib/hooks/usePollingContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { POLLING_CONFIG, type PollingConfigKey } from '@/config/polling';

interface PollingWrapperProps {
  configKey: PollingConfigKey;
  children: React.ReactNode;
  className?: string;
}

export default function PollingWrapper({
  configKey,
  children,
  className = '',
}: PollingWrapperProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const { isPollingPaused } = usePollingContext();
  const config = POLLING_CONFIG[configKey];

  const pollForUpdates = async () => {
    try {
      // Only poll if the page is visible and polling is not paused
      if (document.visibilityState === 'visible' && !isPollingPaused) {
        router.refresh();
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  };

  const { isPolling } = usePolling(pollForUpdates, {
    interval: config.interval,
    enabled: config.enabled && isVisible && !isPollingPaused,
    immediate: false,
    onError: error => {
      console.error('Polling failed:', error);
    },
  });

  // Pause polling when page is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className={className}>
      {children}
      {/* Optional: Add a subtle indicator when polling is active */}
      {isPolling && config.showNotifications && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs animate-pulse">
          Live
        </div>
      )}
    </div>
  );
}
