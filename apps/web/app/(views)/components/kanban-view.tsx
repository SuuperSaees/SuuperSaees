'use client';

import { KanbanViewItem, KanbanViewProps } from '../types';

const KanbanView = <T extends KanbanViewItem>({
  data,
  columns,
}: KanbanViewProps<T>) => {
  return `Kanban view component: ${JSON.stringify(data) || JSON.stringify(columns)}`;
};

export default KanbanView;
