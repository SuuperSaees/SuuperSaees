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
import { ViewCustomComponents } from '../views.types';

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
  customComponent,
  preferences,
  setData,
  onUpdateFn,
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

  const [headers, setHeaders] = useState<CalendarCell<T>['headers']>([]);
  const [cells, setCells] = useState<CalendarCell<T>['content']>([]);
  const { createCells, updateCells } = useCalendarCells<T>(
    calendarConfig.referenceDate,
    cells,
    setCells,
    onUpdateFn,
    setData as unknown as React.Dispatch<React.SetStateAction<CalendarItem[]>>,
  );
  const navigation = useCalendarNavigation(calendarConfig, setCalendarConfig);

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
    setCells(initialCells.content);
    setHeaders(initialCells.headers);
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
    headers,
    currentView: calendarConfig.view,
    currentDate: calendarConfig.currentDate,
    startDate: calendarConfig.startDate,
    endDate: calendarConfig.endDate,
    referenceDate: calendarConfig.referenceDate,
    ...navigation,
    customComponent:
      customComponent as unknown as ViewCustomComponents<CalendarItem>['calendar'],
    preferences,
    isDateToday: dateUtils.isDateToday,
    isDateSameMonth: (date: string) =>
      dateUtils.isDateInMonth(date, calendarConfig.referenceDate),
    updateCells,
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
