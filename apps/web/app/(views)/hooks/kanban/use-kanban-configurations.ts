import { useCallback, useEffect, useState } from 'react';

import { KanbanItem } from '~/(views)/kanban.types';
import { ViewConfigurations } from '~/(views)/view-config.types';

const useKanbanConfigurations = <T extends KanbanItem>(
  initialConfigurations: ViewConfigurations<T>,
) => {
  const [configurations, setConfigurations] = useState<ViewConfigurations<T>>(
    initialConfigurations,
  );

  const updateGroupKey = useCallback((newGroupKey: keyof T) => {
    setConfigurations((prev) => ({
      ...prev,
      group: {
        ...prev.group,
        groupBy: { ...prev.group.groupBy, selected: newGroupKey },
      },
    }));
  }, []);

  useEffect(() => {
    setConfigurations(initialConfigurations);
  }, [initialConfigurations]);
  return {
    configurations,
    setConfigurations,
    updateGroupKey,
  };
};

export default useKanbanConfigurations;
