'use client';

import { usePolling } from '@/lib/hooks/usePolling';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface EventPollingWrapperProps {
  _eventId: string;
  children: React.ReactNode;
}

export default function EventPollingWrapper({
  _eventId,
  children,
}: EventPollingWrapperProps) {
  const router = useRouter();

  const pollForUpdates = async () => {
    try {
      // This will trigger a revalidation of the page data
      // Next.js will refetch the data and update the UI
      router.refresh();
    } catch (error) {
      console.error('Polling error:', error);
    }
  };

  const { isPolling } = usePolling(pollForUpdates, {
    interval: 10000, // Poll every 10 seconds
    enabled: true,
    immediate: false, // Don't poll immediately, wait for first interval
    onError: error => {
      console.error('Polling failed:', error);
    },
  });

  // Show a subtle indicator when polling is active
  useEffect(() => {
    if (isPolling) {
      // You could add a subtle indicator here if desired
      // For now, we'll keep it silent to avoid UI noise
    }
  }, [isPolling]);

  return <>{children}</>;
}
