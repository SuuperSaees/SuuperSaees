'use client';

import { createContext, useContext } from 'react';

import useKanban from '../hooks/kanban/use-kanban';
import { KanbanColumn, KanbanItem } from '../kanban.types';
import { ViewConfigurations } from '../view-config.types';
import { UpdateFunction } from '../views.types';

export interface KanbanContextProps<T extends KanbanItem> {
  columns: KanbanColumn[];
  configurations: ViewConfigurations<T>;
  availableProperties: [keyof T];
  setColumns: React.Dispatch<React.SetStateAction<KanbanColumn[]>>;
  setConfigurations: React.Dispatch<
    React.SetStateAction<ViewConfigurations<T>>
  >;
  updateGroup: (groupKey: keyof T) => KanbanColumn[];
  onUpdateFn?: UpdateFunction
}

// Create a generic context
const KanbanContext = createContext<
  KanbanContextProps<KanbanItem> | undefined
>(undefined);

// Context provider
interface KanbanProviderProps<T extends KanbanItem> {
  children: React.ReactNode;
  initialData: T[];
  initialConfigurations: ViewConfigurations<T>;
  availableProperties: [keyof T];
  onUpdateFn?: UpdateFunction
}

export const KanbanProvider = <T extends KanbanItem>({
  children,
  initialData,
  initialConfigurations,
  availableProperties = ['status'] as [keyof T],
  onUpdateFn
}: KanbanProviderProps<T>) => {
  const {
    columns,
    configurations,
    setColumns,
    setConfigurations,
    updateGroup,
  } = useKanban(initialData, initialConfigurations, onUpdateFn);
  // console.log('configurations from KanbanContext', configurations, initialConfigurations);
  return (
    <KanbanContext.Provider
      value={{
        columns,
        configurations:
          configurations as unknown as ViewConfigurations<KanbanItem>,
        availableProperties: availableProperties as unknown as [keyof KanbanItem],
        setColumns,
        setConfigurations: setConfigurations as unknown as React.Dispatch<
          React.SetStateAction<ViewConfigurations<KanbanItem>>
        >,
        updateGroup,
        onUpdateFn: onUpdateFn as unknown as UpdateFunction
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
