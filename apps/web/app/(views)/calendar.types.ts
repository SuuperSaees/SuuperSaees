import { BaseItem, ViewProps } from './views.types';

// Strict type (must have props) for calendar view item
export interface CalendarItem extends BaseItem {
  startDate: string;
  endDate?: string;
  color: string;
  // add more props for calendar view item as needed
}

// Calendar view props
export type CalendarViewProps<T extends CalendarItem> = ViewProps<T>;