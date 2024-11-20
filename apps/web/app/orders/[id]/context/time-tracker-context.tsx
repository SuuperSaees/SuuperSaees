'use client';


import React, { createContext, useContext, useState } from 'react';

interface TimeTrackerContextType {
  activeTimer: {
    subtaskId: string | null;
    taskId: string | null;
    subtaskName: string | null;
    startTime: number | null;
    elapsedTime: number;
  };
  setActiveTimer: (data: {
    subtaskId: string | null;
    taskId: string | null;
    subtaskName: string | null;
    startTime: number | null;
    elapsedTime: number;
  }) => void;
}

const TimeTrackerContext = createContext<TimeTrackerContextType | undefined>(undefined);

export function TimeTrackerProvider({ children }: { children: React.ReactNode }) {
  const [activeTimer, setActiveTimer] = useState<TimeTrackerContextType['activeTimer']>({
    subtaskId: null,
    taskId: null,
    subtaskName: null,
    startTime: null,
    elapsedTime: 0,
  });

  return (
    <TimeTrackerContext.Provider value={{ activeTimer, setActiveTimer }}>
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