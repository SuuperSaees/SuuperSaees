'use client';

import { CalendarViewItem, CalendarViewProps } from '../types';

const CalendarView = <T extends CalendarViewItem>({
  data,
}: CalendarViewProps<T>) => {
  return `Calendar view component: ${JSON.stringify(data)}`;
};

export default CalendarView;
