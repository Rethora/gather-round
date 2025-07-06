'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface PollingContextType {
  isPollingPaused: boolean;
  pausePolling: () => void;
  resumePolling: () => void;
  togglePolling: () => void;
}

const PollingContext = createContext<PollingContextType | undefined>(undefined);

export function PollingProvider({ children }: { children: ReactNode }) {
  const [isPollingPaused, setIsPollingPaused] = useState(false);

  const pausePolling = () => setIsPollingPaused(true);
  const resumePolling = () => setIsPollingPaused(false);
  const togglePolling = () => setIsPollingPaused(prev => !prev);

  return (
    <PollingContext.Provider
      value={{
        isPollingPaused,
        pausePolling,
        resumePolling,
        togglePolling,
      }}
    >
      {children}
    </PollingContext.Provider>
  );
}

export function usePollingContext() {
  const context = useContext(PollingContext);
  if (context === undefined) {
    throw new Error('usePollingContext must be used within a PollingProvider');
  }
  return context;
}
