import { ViewConfigurations } from './view-config.types';
import { BaseItem, UpdateFunction, ViewColumn, ViewCustomComponents, ViewProps, ViewUser } from './views.types';

// Strict type (must have props) for kanban view item
export interface KanbanItem extends BaseItem {
  id: string;
  title: string;
  column: ViewColumn['key'];
  position: number;
  status: string;
  priority: string;
  description?: string;
  assignees?: ViewUser[];
  // add more props for kanban view item as needed
}

// Kanban view column
export interface KanbanColumn extends ViewColumn {
  id: string;
  position: number;
  color: string;
  count: {
    total: number;
  };
  is_visible: boolean;
  value_type: 'string-object-user' | 'string-default';
  items: KanbanItem[];
  type: keyof KanbanItem;
}

// Kanban view props
export interface KanbanViewProps<T extends KanbanItem> extends ViewProps<T> {
  columns: KanbanColumn[];
}

// Kanban context 
export interface KanbanContextProps<T extends KanbanItem> {
  columns: KanbanColumn[];
  configurations: ViewConfigurations<T>;
  availableProperties: [keyof T];
  customComponents?: ViewCustomComponents<T>;
  setColumns: React.Dispatch<React.SetStateAction<KanbanColumn[]>>;
  setConfigurations: React.Dispatch<
    React.SetStateAction<ViewConfigurations<T>>
  >;
  updateGroup: (groupKey: keyof T) => KanbanColumn[];
  onUpdateFn?: UpdateFunction;
  setData: React.Dispatch<React.SetStateAction<KanbanItem[]>>;
}

// Context provider
export interface KanbanProviderProps<T extends KanbanItem> {
  children: React.ReactNode;
  initialData: T[];
  initialConfigurations: ViewConfigurations<T>;
  availableProperties: [keyof T];
  customComponents?: ViewCustomComponents<T>;
  onUpdateFn: UpdateFunction;
  data: T[];
  setData: React.Dispatch<React.SetStateAction<T[]>>;
}

export type KanbanUpdateFunction = ({
  updatedType,
  column,
  columns,
  item,
  items,
  targetItem
}: {
  updatedType: 'column' | 'item';
  column?: KanbanColumn;
  columns: KanbanColumn[];
  item?: KanbanItem;
  items?: KanbanItem[];
  targetItem?: KanbanItem;
}, executeMuatation?: boolean) => Promise<void>;
