import { useCallback } from 'react';
import type React from 'react';

// Added import for React
import {
  CalendarConfig,
  CalendarView,
  CalendarViewInterval,
  CalendarVisibleColumnDays,
} from '~/(views)/calendar.types';
import { dateUtils } from '~/(views)/utils/calendar/dates';

/**
 * Custom hook for handling calendar navigation and view changes
 * @param {CalendarConfig} calendarConfig - Current calendar configuration state
 * @param {React.Dispatch<React.SetStateAction<CalendarConfig>>} setCalendarConfig - State setter for calendar configuration
 * @returns {Object} Navigation functions for the calendar
 */
const useCalendarNavigation = (
  calendarConfig: CalendarConfig,
  setCalendarConfig: React.Dispatch<React.SetStateAction<CalendarConfig>>,
) => {
  /**
   * Updates the calendar dates based on a new reference date
   * @param {string} newReferenceDate - ISO string of the new reference date
   */
  const updateCalendarDates = useCallback(
    (newReferenceDate: string) => {
      setCalendarConfig((prev) => ({
        ...prev,
        referenceDate: newReferenceDate,
        startDate: dateUtils.getStartDate(
          prev.startOfWeek,
          newReferenceDate,
          prev.view,
        ),
        endDate: dateUtils.getEndDate(
          prev.startOfWeek,
          newReferenceDate,
          prev.view,
        ),
      }));
    },
    [setCalendarConfig],
  );

  /**
   * Updates the calendar view and adjusts related configurations
   * @param {CalendarView} view - New calendar view to be set
   */
  const updateView = useCallback(
    (view: CalendarView) => {
      setCalendarConfig((prev) => ({
        ...prev,
        view,
        interval:
          view === CalendarView.MONTH
            ? CalendarViewInterval.MONTH
            : CalendarViewInterval.WEEK,
        visibleColumnDays:
          view === CalendarView.MONTH
            ? CalendarVisibleColumnDays.MONTH
            : CalendarVisibleColumnDays.WEEK,
        startDate: dateUtils.getStartDate(
          prev.startOfWeek,
          prev.referenceDate,
          view,
        ),
        endDate: dateUtils.getEndDate(
          prev.startOfWeek,
          prev.referenceDate,
          view,
        ),
      }));
    },
    [setCalendarConfig],
  );

  /**
   * Navigates to the next time period (week or month) based on current view
   */
  const goToNextDate = useCallback(() => {
    const date = new Date(calendarConfig.referenceDate);
    date.setHours(0, 0, 0, 0);
    if (calendarConfig.view === CalendarView.MONTH) {
      date.setDate(1);
    }
    const newDate = dateUtils.getNextDate(date, calendarConfig.view);
    updateCalendarDates(dateUtils.formatDateToISO(newDate));
  }, [calendarConfig.referenceDate, calendarConfig.view, updateCalendarDates]);

  /**
   * Navigates to the previous time period (week or month) based on current view
   */
  const goToPrevDate = useCallback(() => {
    const date = new Date(calendarConfig.referenceDate);
    date.setHours(0, 0, 0, 0);
    const newDate = dateUtils.getPrevDate(date, calendarConfig.view);
    updateCalendarDates(dateUtils.formatDateToISO(newDate));
  }, [calendarConfig.referenceDate, calendarConfig.view, updateCalendarDates]);

  /**
   * Navigates to the current date
   */
  const goToCurrentDate = useCallback(() => {
    updateCalendarDates(dateUtils.getCurrentDate());
  }, [updateCalendarDates]);

  return {
    goToNextDate,
    goToPrevDate,
    goToCurrentDate,
    updateView,
  };
};

export default useCalendarNavigation;
