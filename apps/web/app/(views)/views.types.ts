import { CalendarItem } from './calendar.types';
import { KanbanItem } from './kanban.types';
import { ViewConfigurations } from './view-config.types';

// ITEM TYPES
// Base, shared props for all view items
export interface BaseItem {
  id: string | number;
  title: string;
}

export interface ViewUser {
  id: string;
  name: string;
  picture_url: string;
}

export type ViewType = 'kanban' | 'calendar' | 'table'; // add more view types as needed

export enum ViewTypeEnum {
  Kanban = 'kanban',
  Calendar = 'calendar',
  Table = 'table',
}
export type ViewPropertyType =
  | 'text'
  | 'number'
  | 'select'
  | 'multi-select'
  | 'status'
  | 'date'
  | 'users';

export type ViewItem = BaseItem | KanbanItem | CalendarItem;

// Examples of ViewPropertyType, given an Item:
// multi-select: priority: ['high', 'low', 'medium'],
// select: status: 'open',
// users: assignees: [{id: '1', name: 'John Doe', picture_url: 'https://...'}]
// text: title: 'John Doe'

export type ViewManageableProperty = {
  id: string;
  key: string;
  name: string;
  position: number;
  visible: boolean;
  color?: string;
};

// Base config type for all columns
export interface ViewColumn {
  key: string;
  name: string;
}

// Base and sharable props for all the views
export interface ViewProps<T extends ViewItem> {
  data: T[];
  configurations?: ViewConfigurations<T>;
  onAction?: (action: string, payload: T) => Promise<void | T>;
}

// Custom components for each view
export interface ViewCustomComponents<T> {
  kanban?: {
    Card: React.FC<{ item: T, className?: string, [key: string]: unknown }>; // Card component for the kanban view
  };
  calendar?: {
    Card: React.FC<{ item: T, className?: string, [key: string]: unknown }>; // Card component for the calendar view
  };
}

export type UpdateFunction = <T>(data: T, property?: keyof T) => Promise<T> ;