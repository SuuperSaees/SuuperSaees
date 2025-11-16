export const CALENDAR_CONSTANTS = {
  DEFAULT_START_OF_WEEK: 0, // Sunday
  DAYS_IN_WEEK: 7,
  MONTH_VIEW_DAYS: 35, // 5 weeks
  WEEK_VIEW_DAYS: 7,
} as const;

export const DATE_FORMATS = {
  FULL_DAY: 'EEEE',
  ISO_DATE: { representation: 'date' as const },
} as const;
