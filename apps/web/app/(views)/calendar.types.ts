import { BaseItem, ViewProps } from './views.types';

// Strict type (must have props) for calendar view item
export interface CalendarItem extends BaseItem {
  due_date: string;
  color: string;
  // add more props for calendar view item as needed
}

// Calendar view props
export type CalendarViewProps<T extends CalendarItem> = ViewProps<T>;

export interface CalendarContextType<T extends CalendarItem> {
  data: T[];
  setData: React.Dispatch<React.SetStateAction<T[]>>;
}

export interface CalendarProviderProps<T extends CalendarItem> {
  children: React.ReactNode;
  data: T[];
  setData: React.Dispatch<React.SetStateAction<T[]>>;
}
