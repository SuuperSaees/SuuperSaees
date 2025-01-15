// import { useEffect, useMemo, useState } from 'react';

// import { KanbanColumn, KanbanItem } from '~/(views)/kanban.types';
// import { createColumnsByGroup } from '~/(views)/utils/kanban/data-transform';
// import { ViewConfigurations } from '~/(views)/view-config.types';

// import useKanbanColumns from './use-kanban-columns';
// import useKanbanConfigurations from './use-kanban-configurations';
// import { UpdateFunction } from '~/(views)/views.types';

// const useKanban = <T extends KanbanItem>(
//   data: T[],
//   initialConfigurations: ViewConfigurations<T>,
//   onUpdateFn?: UpdateFunction
// ) => {
//   // Configurations
//   const { configurations, setConfigurations, updateGroupKey } =
//     useKanbanConfigurations(initialConfigurations);

//   // Columns
//   const groupValues = useMemo(
//     () => [
//       ...configurations.group.visibility.visible.options,
//       ...configurations.group.visibility.hidden.options,
//     ],
//     [
//       configurations.group.visibility.visible.options,
//       configurations.group.visibility.hidden.options,
//     ],
//   );

//   const groupSelected = configurations.group.groupBy.selected;

//   const initialColumns = useMemo(() => {
//     return createColumnsByGroup(groupSelected, data, groupValues);
//   }, [groupSelected, data, groupValues]);

//   const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns ?? []);
//   const { updateColumnsByGroup } = useKanbanColumns(columns, setColumns, onUpdateFn);

//   const updateGroup = (newGroupKey: keyof KanbanItem) => {
//     updateGroupKey(newGroupKey);
//     const updatedColumns = updateColumnsByGroup(data, newGroupKey, [
//       ...configurations.group.visibility.visible.options,
//       ...configurations.group.visibility.hidden.options,
//     ]);
//     return updatedColumns;
//   };

//   // Sync the columns state when `columns` changes
//   useEffect(() => {
//     setColumns(initialColumns);
//   }, [initialColumns]);
//   return {
//     columns,
//     configurations,
//     setColumns,
//     setConfigurations,
//     updateGroup,
//   };
// };

// export default useKanban;
