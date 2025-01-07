export type ViewType = 'kanban' | 'calendar'; // add more view types as needed

// ITEM TYPES

// Base, shared props for all view items
export interface ViewItem {
  id: string;
  title: string;
}

// Strict type (must have props) for kanban view item
export interface KanbanViewItem extends ViewItem {
  column: string;
  position: number;
  // add more props for kanban view item as needed
}

// Strict type (must have props) for calendar view item
export interface CalendarViewItem extends ViewItem {
  startDate: string;
  endDate?: string;
  color: string;
  // add more props for calendar view item as needed
}


// CONFIG TYPES

// Base config type for all views
export interface ViewConfiguration<T> {
  filters?: (item: T) => boolean; // A function to filter items dynamically
  sort?: (a: T, b: 'asc' | 'desc') => number; // A function to sort items dynamically
}


// COMPONENT VIEW PROPS

// Base and sharable props for all the views
export interface ViewProps<T extends ViewItem> {
  data: T[];
  configuration?: ViewConfiguration<T>
  onAction?: (action: string, payload: T) =>  Promise<void | T>
}

// Kanban view props
export interface KanbanViewProps<T extends KanbanViewItem> extends ViewProps<T> {
  columns: string[];
}

// Calendar view props
export type CalendarViewProps<T extends CalendarViewItem> = ViewProps<T>;