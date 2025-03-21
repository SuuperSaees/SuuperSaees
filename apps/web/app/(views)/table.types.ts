import { ColumnDef } from '@tanstack/react-table';
import { BaseItem, ViewProps } from './views.types';
import { ControllersProps } from '../components/table/table';
import { CustomConfigs } from '@kit/ui/data-table';

// Strict type (must have props) for calendar view item
export type TableItem = BaseItem;

// Calendar view props
export type CalendarViewProps<T extends TableItem> = ViewProps<T>;

// Context type
export interface TableContextType<T extends TableItem> {
  data: T[];
  columns: ColumnDef<T>[];
  emptyState: React.ReactNode;
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  controllers?: ControllersProps
  configs?: CustomConfigs
}

// Context provider
export interface TableProviderProps<T extends TableItem> {
  children: React.ReactNode;
  data: T[];
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  columns: ColumnDef<T>[]
  emptyState: React.ReactNode
  controllers?: ControllersProps 
  configs?: CustomConfigs
}