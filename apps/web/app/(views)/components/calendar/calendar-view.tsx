'use client';

import { useViewContext } from "../../contexts/view-context";


const CalendarView = () => {
  const { data } = useViewContext(); // replace with useCalendarContext
  return `Calendar view component: ${JSON.stringify(data)}`;
};

export default CalendarView;
