'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import {
  CalendarCell,
  CalendarConfig,
  CalendarContextType,
  CalendarItem,
  CalendarProviderProps,
  CalendarView,
  CalendarViewInterval,
  CalendarVisibleColumnDays,
  WeekDaysIndex,
} from '../calendar.types';
import { useCalendarCells } from '../hooks/calendar/use-calendar-cells';
import useCalendarNavigation from '../hooks/calendar/use-calendar-navigation';
import { dateUtils } from '../utils/calendar/dates';

/**
 * Context for managing calendar state and operations
 * @template T extends CalendarItem
 */
const CalendarContext = createContext<
  CalendarContextType<CalendarItem> | undefined
>(undefined);

/**
 * Provider component for calendar functionality
 * @template T - Type extending CalendarItem
 * @component
 * @param {CalendarProviderProps<T>} props - Provider props
 * @param {React.ReactNode} props.children - Child components
 * @param {T[]} props.data - Calendar items data
 * @param {React.Dispatch<React.SetStateAction<T[]>>} props.setData - Function to update calendar data
 * @returns {JSX.Element} Calendar provider component
 */
export const CalendarProvider = <T extends CalendarItem>({
  children,
  data,
  setData,
}: CalendarProviderProps<T>) => {
  // Initialize with current date
  const currentDate = dateUtils.getCurrentDate();

  /**
   * Calendar configuration state
   */
  const [calendarConfig, setCalendarConfig] = useState<CalendarConfig>({
    startOfWeek: WeekDaysIndex.SUNDAY,
    startDate: dateUtils.getStartDate(
      WeekDaysIndex.SUNDAY,
      currentDate,
      CalendarView.MONTH,
    ),
    endDate: dateUtils.getEndDate(
      WeekDaysIndex.SUNDAY,
      currentDate,
      CalendarView.MONTH,
    ),
    currentDate,
    referenceDate: currentDate,
    view: CalendarView.MONTH,
    interval: CalendarViewInterval.MONTH,
    visibleColumnDays: CalendarVisibleColumnDays.MONTH,
  });

  const { createCells } = useCalendarCells<T>(calendarConfig.referenceDate);
  const navigation = useCalendarNavigation(calendarConfig, setCalendarConfig);
  const [cells, setCells] = useState<CalendarCell<T> | null>(null);

  /**
   * Effect to initialize and update calendar cells when data or configuration changes
   */
  useEffect(() => {
    const initialCells = createCells(
      data,
      calendarConfig.startDate,
      calendarConfig.endDate,
      calendarConfig.visibleColumnDays,
    );
    setCells(initialCells);
  }, [data, createCells, calendarConfig]);

  /**
   * Combined calendar context value
   */
  const value = {
    data: data as unknown as CalendarItem[],
    setData: setData as unknown as React.Dispatch<
      React.SetStateAction<CalendarItem[]>
    >,
    cells,
    currentView: calendarConfig.view,
    currentDate: calendarConfig.currentDate,
    startDate: calendarConfig.startDate,
    endDate: calendarConfig.endDate,
    referenceDate: calendarConfig.referenceDate,
    ...navigation,
    isDateToday: dateUtils.isDateToday,
    isDateSameMonth: (date: string) =>
      dateUtils.isDateInMonth(date, calendarConfig.referenceDate),
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

/**
 * Hook to access calendar context
 * @throws {Error} If used outside of CalendarProvider
 * @returns {CalendarContextType<CalendarItem>} Calendar context value
 */
export const useCalendarContext = () => {
  const context = useContext(CalendarContext);

  if (!context) {
    throw new Error(
      'useCalendarContext must be used within a CalendarProvider',
    );
  }

  return context;
};
