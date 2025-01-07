import { KanbanColumn as KanbanColumnType } from '~/(views)/kanban.types';

import styles from '../../../../components/ui/styles.module.css';
import KanbanColumn from './kanban-column';

const KanbanColumns = ({ columns }: { columns: KanbanColumnType[] }) => {
  return (
    <div
      className={`flex max-w-full gap-4 overflow-y-auto p-4 ${styles['scrollbar-thin']}`}
    >
      {columns?.map((column) => (
        <KanbanColumn column={column} key={column.key} />
      ))}
    </div>
  );
};

export default KanbanColumns;
