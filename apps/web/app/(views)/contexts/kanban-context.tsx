'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import useKanbanColumns from '../hooks/kanban/use-kanban-columns';
import useKanbanConfigurations from '../hooks/kanban/use-kanban-configurations';
import { KanbanColumn, KanbanItem } from '../kanban.types';
import { createColumnsByGroup } from '../utils/kanban/data-transform';
import { ViewConfigurations } from '../view-config.types';
import { UpdateFunction, ViewCustomComponents } from '../views.types';

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
}

// Create a generic context
const KanbanContext = createContext<KanbanContextProps<KanbanItem> | undefined>(
  undefined,
);

// Context provider
interface KanbanProviderProps<T extends KanbanItem> {
  children: React.ReactNode;
  initialData: T[];
  initialConfigurations: ViewConfigurations<T>;
  availableProperties: [keyof T];
  customComponents?: ViewCustomComponents<T>;
  onUpdateFn?: UpdateFunction;
  data: T[];
  setData: React.Dispatch<React.SetStateAction<T[]>>;
}

export const KanbanProvider = <T extends KanbanItem>({
  children,
  initialConfigurations,
  availableProperties = ['status'] as [keyof T],
  customComponents,
  onUpdateFn,
  data,
}: KanbanProviderProps<T>) => {
  // Configurations
  const { configurations, setConfigurations, updateGroupKey } =
    useKanbanConfigurations(initialConfigurations);

  // Columns
  const groupValues = useMemo(
    () => [
      ...configurations.group.visibility.visible.options,
      ...configurations.group.visibility.hidden.options,
    ],
    [
      configurations.group.visibility.visible.options,
      configurations.group.visibility.hidden.options,
    ],
  );

  const groupSelected = configurations.group.groupBy.selected;

  const initialColumns = useMemo(() => {
    return createColumnsByGroup(groupSelected, data, groupValues);
  }, [groupSelected, data, groupValues]);

  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns ?? []);
  const { updateColumnsByGroup } = useKanbanColumns(
    columns,
    setColumns,
    onUpdateFn,
  );

  const updateGroup = useCallback(
    (newGroupKey: keyof KanbanItem) => {
      updateGroupKey(newGroupKey);
      const updatedColumns = updateColumnsByGroup(data, newGroupKey, [
        ...configurations.group.visibility.visible.options,
        ...configurations.group.visibility.hidden.options,
      ]);
      setColumns(updatedColumns);
      return updatedColumns;
    },
    [updateColumnsByGroup, setColumns, data, configurations, updateGroupKey],
  );
  console.log('data', data.find((item) => item.id === 16)?.status)
  useEffect(() => {
    const newColumns = createColumnsByGroup(groupSelected, data, groupValues);
    setColumns(newColumns);
  }, [groupSelected, data, groupValues])

  return (
    <KanbanContext.Provider
      value={{
        columns,
        configurations:
          configurations as unknown as ViewConfigurations<KanbanItem>,
        availableProperties: availableProperties as unknown as [
          keyof KanbanItem,
        ],
        customComponents:
          customComponents as unknown as ViewCustomComponents<KanbanItem>,
        setColumns,
        setConfigurations: setConfigurations as unknown as React.Dispatch<
          React.SetStateAction<ViewConfigurations<KanbanItem>>
        >,
        updateGroup,
        onUpdateFn: onUpdateFn as unknown as UpdateFunction,
      }}
    >
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanbanContext = <T extends KanbanItem>() => {
  const context = useContext(KanbanContext);

  if (!context) {
    throw new Error('useKanbanContext must be used within a KanbanProvider');
  }

  return context as unknown as KanbanContextProps<T>;
};

export default KanbanProvider;
