import { useCallback } from 'react';

import { addDays, formatISO, parseISO } from 'date-fns';

import { CalendarCell, CalendarItem } from '~/(views)/calendar.types';
import { DATE_FORMATS } from '~/(views)/utils/calendar/constants';
import { dateUtils } from '~/(views)/utils/calendar/dates';

/**
 * Interface for calendar cell creation parameters
 * @template T - Type extending CalendarItem
 */

/**
 * Custom hook for managing calendar cell creation and data organization
 * @template T - Type extending CalendarItem with required due_date property
 * @param {string} referenceDate - ISO formatted date string used as reference for current month calculations
 * @returns {Object} Object containing createCells function
 */
export function useCalendarCells<T extends CalendarItem>(
  referenceDate: string,
) {
  /**
   * Creates calendar cells with headers and content based on provided data and date range
   * @param {T[]} data - Array of calendar items to be displayed
   * @param {string} startDate - ISO formatted start date string
   * @param {string} endDate - ISO formatted end date string
   * @param {number} visibleColumnDays - Number of visible days in calendar view
   * @returns {CalendarCell<T>} Object containing headers and content arrays for calendar display
   */
  const createCells = useCallback(
    (
      data: T[],
      startDate: string,
      endDate: string,
      visibleColumnDays: number,
    ): CalendarCell<T> => {
      const newStartDate = parseISO(startDate);
      const newEndDate = parseISO(endDate);

      // Create a Map for O(1) lookup of items by date
      const dateItemsMap = new Map<string, T[]>();
      data.forEach((item) => {
        if (!item.due_date) return;
        try {
          const itemDate = parseISO(item.due_date);
          const isoDate = formatISO(itemDate, DATE_FORMATS.ISO_DATE);
          dateItemsMap.set(isoDate, [
            ...(dateItemsMap.get(isoDate) ?? []),
            item,
          ]);
        } catch (error) {
          console.error('Error parsing due_date:', item.due_date, error);
        }
      });

      /**
       * Generate header cells for the calendar view
       * Each header contains date information and formatting for the column
       */
      const headers = Array.from({ length: visibleColumnDays }, (_, i) => {
        const date = addDays(newStartDate, i);
        const formattedDate = formatISO(date, DATE_FORMATS.ISO_DATE);
        return {
          date: formattedDate,
          title: dateUtils.formatDayName(date),
          isToday: dateUtils.isDateToday(formattedDate),
          isWithinCurrentMonth: dateUtils.isDateInMonth(
            formattedDate,
            referenceDate,
          ),
        };
      });

      /**
       * Generate content cells for each day in the date range
       * Each cell contains items for that date and formatting information
       */
      const content = [];
      for (
        let date = newStartDate;
        date <= newEndDate;
        date = addDays(date, 1)
      ) {
        const formattedDate = formatISO(date, DATE_FORMATS.ISO_DATE);
        content.push({
          date: formattedDate,
          items: dateItemsMap.get(formattedDate) ?? [],
          isToday: dateUtils.isDateToday(formattedDate),
          isWithinCurrentMonth: dateUtils.isDateInMonth(
            formattedDate,
            referenceDate,
          ),
        });
      }

      return { headers, content };
    },
    [referenceDate],
  );

  return { createCells };
}
