'use client';


import React, { createContext, useContext, useState } from 'react';
import { Timer, TimeTrackerContextType } from '~/lib/timer.types';

const TimeTrackerContext = createContext<TimeTrackerContextType | undefined>(undefined);

export function TimeTrackerProvider({ children }: { children: React.ReactNode }) {
  const [activeTimer, setActiveTimer] = useState<Timer>({
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