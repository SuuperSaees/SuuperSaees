'use client';

import { useKanbanContext } from '../../contexts/kanban-context';
import KanbanColumns from './kanban-columns';

const KanbanView = () => {
  const { columns } = useKanbanContext();

  return <KanbanColumns columns={columns} />;
};

export default KanbanView;
