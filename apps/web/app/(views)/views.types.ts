import { CalendarItem } from './calendar.types';
import { KanbanItem } from './kanban.types';
import { ViewConfigurations } from './view-config.types';

// ITEM TYPES
// Base, shared props for all view items
export interface BaseItem {
  id: string;
  title: string;
}

export interface ViewUser {
  id: string;
  name: string;
  picture_url: string;
}

export type ViewType = 'kanban' | 'calendar'; // add more view types as needed

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
