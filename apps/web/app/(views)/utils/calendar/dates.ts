import { format, isSameMonth, isWeekend } from 'date-fns';
import { isToday } from 'date-fns';
import {
  addMonths,
  addWeeks,
  endOfWeek,
  formatISO,
  parseISO,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns';

import { WeekDaysIndex } from '~/(views)/calendar.types';
import { CalendarView } from '~/(views)/calendar.types';
import { DATE_FORMATS } from './constants';

export const dateUtils = {
  getStartDate: (
    startOfWeekNumber: WeekDaysIndex,
    currentDate: string,
    view: CalendarView,
  ): string => {
    const date = parseISO(currentDate);
    const options = { weekStartsOn: startOfWeekNumber };

    return formatISO(
      view === CalendarView.MONTH
        ? startOfWeek(new Date(date.getFullYear(), date.getMonth(), 1), options)
        : startOfWeek(date, options),
    );
  },

  getEndDate: (
    startOfWeekNumber: WeekDaysIndex,
    currentDate: string,
    view: CalendarView,
  ): string => {
    const date = parseISO(currentDate);
    const options = { weekStartsOn: startOfWeekNumber };

    return formatISO(
      view === CalendarView.MONTH
        ? endOfWeek(
            new Date(date.getFullYear(), date.getMonth() + 1, 0),
            options,
          )
        : endOfWeek(date, options),
    );
  },

  getNextDate: (date: Date, view: CalendarView): Date =>
    view === CalendarView.MONTH ? addMonths(date, 1) : addWeeks(date, 1),

  getPrevDate: (date: Date, view: CalendarView): Date =>
    view === CalendarView.MONTH ? subMonths(date, 1) : subWeeks(date, 1),

  getCurrentDate: (): string => formatISO(new Date()),

  formatDateToISO: (date: Date): string => formatISO(date),

  isDateToday: (date: string): boolean => isToday(parseISO(date)),

  isDateInMonth: (date: string, referenceDate: string): boolean =>
    isSameMonth(parseISO(date), parseISO(referenceDate)),

  formatDayName: (date: Date): string => format(date, DATE_FORMATS.FULL_DAY),

  isDateWeekend: (date: string): boolean => isWeekend(parseISO(date)),

};
