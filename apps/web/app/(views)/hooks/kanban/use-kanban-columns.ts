import { useCallback } from 'react';

import { KanbanItem } from '~/(views)/kanban.types';
import { createColumnsByGroup } from '~/(views)/utils/kanban/data-transform';
import { ViewManageableProperty } from '~/(views)/views.types';

const useKanbanColumns = <T extends KanbanItem>() => {
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

  return {
    updateColumns,
    createColumnsByGroup,
  };
};

export default useKanbanColumns;
