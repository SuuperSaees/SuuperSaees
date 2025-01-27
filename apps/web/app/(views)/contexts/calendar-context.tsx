'use client';

import { createContext, useContext } from 'react';

import { CalendarContextType, CalendarItem, CalendarProviderProps } from '../calendar.types';

const CalendarContext = createContext<CalendarContextType<CalendarItem> | undefined>(
  undefined,
);

export const CalendarProvider =  <T extends CalendarItem> ({
  children,
  data,
  setData,
}: CalendarProviderProps<T>) => {
  const value = {
    data: data as unknown as CalendarItem[],
    setData: setData as unknown as React.Dispatch<React.SetStateAction<CalendarItem[]>>,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendarContext = () => {
  const context = useContext(CalendarContext);

  if (!context) {
    throw new Error(
      'useCalendarContext must be used within a CalendarProvider',
    );
  }

  return context;
};
