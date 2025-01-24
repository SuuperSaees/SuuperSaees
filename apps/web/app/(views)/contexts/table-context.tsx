'use client';

import { createContext, useContext } from 'react';

import { ColumnDef } from '@tanstack/react-table';

import { TableContextType, TableProviderProps } from '../table.types';
import { ViewItem } from '../views.types';

// Create a generic context
const TableContext = createContext<TableContextType<ViewItem> | undefined>(
  undefined,
);

export const TableProvider = <T extends ViewItem>({
  children,
  data,
  setData,
  columns,
  emptyState,
  controllers,
  configs
}: TableProviderProps<T>) => {
  const value = {
    data,
    columns: columns as unknown as ColumnDef<ViewItem>[],
    emptyState,
    controllers,
    setData: setData as unknown as React.Dispatch<
      React.SetStateAction<ViewItem[]>
    >,
    configs
  };

  return (
    <TableContext.Provider value={value}>{children}</TableContext.Provider>
  );
};

export const useTableContext = () => {
  const context = useContext(TableContext);

  if (!context) {
    throw new Error('useTableContext must be used within a TableProvider');
  }

  return context;
};
