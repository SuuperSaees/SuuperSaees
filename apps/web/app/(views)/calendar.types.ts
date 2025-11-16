import { ViewPreferences } from './view-config.types';
import { BaseItem, UpdateFunction, ViewCustomComponents, ViewProps } from './views.types';

// Strict type (must have props) for calendar view item
export interface CalendarItem extends BaseItem {
  due_date: string;
  color: string;
  // add more props for calendar view item as needed
}

// Calendar cells
export type CalendarCellHeader = {
  date: string;
  title: string;
  isToday: boolean;
  isWeekend: boolean;
  isWithinCurrentMonth: boolean;
};
export type CalendarCellContent<T extends CalendarItem> = {
  date: string;
  isToday: boolean;
  isWeekend: boolean;
  isWithinCurrentMonth: boolean;
  items: T[];
};

export type CalendarCell<T extends CalendarItem> = {
  date: string;
  headers: CalendarCellHeader[];
  content: CalendarCellContent<T>[];
};

// Week days
export enum WeekDays {
  SUNDAY = 'Sunday',
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
}

export enum WeekDaysIndex {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export enum CalendarView {
  MONTH = 'month',
  WEEK = 'week',
}
export enum CalendarViewInterval {
  WEEK = 7,
  MONTH = 35,
}

export namespace CalendarVisibleColumnDays {
  export const WEEK = 7;
  export const MONTH = 7;
  // TODO: add more intervals as needed
  // export WorkWeek = 5;
}

export type CalendarConfig = {
  startOfWeek: WeekDaysIndex;
  startDate: string;
  endDate: string;
  currentDate: string;
  view: CalendarView;
  interval: number;
  visibleColumnDays: number;
  referenceDate: string;
};

// Calendar view props
export type CalendarViewProps<T extends CalendarItem> = ViewProps<T>;

export interface CalendarContextType<T extends CalendarItem> {
  data: T[];
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  cells: CalendarCell<T>['content'];
  headers: CalendarCell<T>['headers'];
  currentView: CalendarView;
  currentDate: string;
  startDate: string;
  endDate: string;
  referenceDate: string;
  customComponent?: ViewCustomComponents<T>['calendar'];
  preferences?: ViewPreferences;
  updateView: (view: CalendarView) => void;
  goToNextDate: () => void;
  goToPrevDate: () => void;
  goToCurrentDate: () => void;
  isDateToday: (date: string) => boolean;
  isDateSameMonth: (date: string) => boolean;
  updateCells: UpdateCalendarFunction;
}

export interface CalendarProviderProps<T extends CalendarItem> {
  children: React.ReactNode;
  data: T[];
  customComponent?: ViewCustomComponents<T>['calendar'];
  preferences?: ViewPreferences;
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  onUpdateFn: UpdateFunction;

}


export type UpdateCalendarFunction = <T extends CalendarItem>(
  updatedItem: T,
  updatedCellContentItems?: CalendarCellContent<T>,
  updatedCellsContentItems?: CalendarCellContent<T>[],
  executeMutation?: boolean,
) => Promise<void>;
