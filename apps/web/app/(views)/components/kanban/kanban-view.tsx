'use client';

import { useKanbanContext } from '../../contexts/kanban-context';
import KanbanColumns from './kanban-columns';

const KanbanView = () => {
  const { columns, setColumns} = useKanbanContext();

  return <KanbanColumns columns={columns} setColumns={setColumns} />;
};

export default KanbanView;
