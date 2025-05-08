'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Timer, TimeTrackerContextType } from '~/lib/timer.types';

const TimeTrackerContext = createContext<TimeTrackerContextType | undefined>(undefined);
const TIMER_STORAGE_KEY = 'activeTimer';

export function TimeTrackerProvider({ children }: { children: React.ReactNode }) {
  const [activeTimer, setActiveTimer] = useState<Timer>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(TIMER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {
        id: null,
        elementId: null,
        elementType: null,
        elementName: null,
        startTime: null,
        elapsedTime: 0,
      };
    }
    return {
      id: null,
      elementId: null,
      elementType: null,
      elementName: null,
      startTime: null,
      elapsedTime: 0,
    };
  });

  const clearTimer = () => {
    localStorage.removeItem(TIMER_STORAGE_KEY);
    setActiveTimer({
      id: null,
      elementId: null,
      elementType: null,
      elementName: null,
      startTime: null,
      elapsedTime: 0,
    });
  };

  // Update localStorage when timer changes
  useEffect(() => {
    if (activeTimer.elementId) {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(activeTimer));
    } else {
      localStorage.removeItem(TIMER_STORAGE_KEY);
    }
  }, [activeTimer]);

  // Listen for changes in other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TIMER_STORAGE_KEY) {
        if (e.newValue) {
          setActiveTimer(JSON.parse(e.newValue));
        } else {
          clearTimer();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <TimeTrackerContext.Provider value={{ activeTimer, setActiveTimer, clearTimer }}>
      {children}
    </TimeTrackerContext.Provider>
  );
}

export function useTimeTracker() {
  const context = useContext(TimeTrackerContext);
  if (context === undefined) {
    throw new Error('useTimeTracker must be used within a TimeTrackerProvider');
  }
  return context;
}