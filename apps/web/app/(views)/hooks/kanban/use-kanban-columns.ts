import { useCallback } from 'react';

import { KanbanColumn, KanbanItem } from '~/(views)/kanban.types';
import { createColumnsByGroup } from '~/(views)/utils/kanban/data-transform';
import { ViewManageableProperty } from '~/(views)/views.types';

const useKanbanColumns = <T extends KanbanItem>(
  columns: KanbanColumn[],
  setColumns: React.Dispatch<React.SetStateAction<KanbanColumn[]>>,
) => {
  // column actioners
  const updateColumns = useCallback(
    (
      data: T[],
      newGroupKey: keyof T,
      updatedGroupValues?: ViewManageableProperty[],
    ) => {
      return createColumnsByGroup(newGroupKey, data, updatedGroupValues);
    },
    [], // Only depends on `data`, as `groupKey` and `groupValues` are passed as arguments
  );

  // Helper to update column positions consistently
  function updateColumnPositions(
    columns: KanbanColumn[],
    isZeroIndexed = true,
  ): KanbanColumn[] {
    return columns.map((column, index) => ({
      ...column,
      position: isZeroIndexed ? index : index + 1,
      count: {
        total: column.items.length
      }
    }));
  }

  // Function to update columns based on the moved columns
  const handleUpdateColumns = (columns: KanbanColumn[]) => {
    const updatedColumns = updateColumnPositions(columns, false);
    setColumns(updatedColumns);
    // perform async or any other logic here (e.g., update the database)
  };
  return {
    updateColumns,
    updateColumnPositions,
    handleUpdateColumns,
    createColumnsByGroup,
  };
};

export default useKanbanColumns;
