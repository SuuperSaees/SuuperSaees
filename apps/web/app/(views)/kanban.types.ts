import { BaseItem, ViewColumn, ViewProps, ViewUser } from './views.types';

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
