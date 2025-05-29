'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import { CalendarItem } from '../calendar.types';
import useViewConfigurations from '../hooks/view/use-view-configurations';
import { KanbanItem } from '../kanban.types';
import { createFullConfiguration } from '../utils/views/data-transform';
import { ViewConfigurations } from '../view-config.types';
import {
  UpdateFunction,
  ViewContextProps,
  ViewCustomComponents,
  ViewItem,
  ViewProviderProps,
  ViewTypeEnum,
} from '../views.types';
import { CalendarProvider } from './calendar-context';
import KanbanProvider from './kanban-context';
import { TableProvider } from './table-context';

// Create a generic context
const ViewContext = createContext<ViewContextProps<ViewItem> | undefined>(
  undefined,
);

export const ViewProvider = <T extends ViewItem>({
  children,
  initialData,
  initialViewType,
  initialConfigurations,
  availableProperties = ['status'] as [keyof T],
  customComponents,
  initialPreferences,
  onUpdateFn,
  data,
  setData,
}: ViewProviderProps<T>) => {
  const newConfigurations = createFullConfiguration<T>(
    initialData,
    initialViewType,
    initialConfigurations,
    availableProperties,
  );

  const [viewType, setViewType] = useState<ViewTypeEnum>(ViewTypeEnum.Table);
  // const [data, setData] = useState<T[]>(initialData);
  const [configurations, setConfigurations] = useState<
    ViewConfigurations<T> | undefined
  >(newConfigurations);

  const manageConfigurations = useViewConfigurations(
    configurations,
    setConfigurations,
  );
  // const updateConfigurations =
  // console.log('v2', )

  const value: ViewContextProps<ViewItem> = {
    viewType,
    data,
    configurations: configurations as unknown as ViewConfigurations<ViewItem>,
    manageConfigurations,
    availableProperties: availableProperties as unknown as [keyof ViewItem],
    customComponents:
      customComponents as unknown as ViewCustomComponents<ViewItem>,
    setViewType,
    setData: setData as unknown as React.Dispatch<
      React.SetStateAction<ViewItem[]>
    >,
    setConfigurations: setConfigurations as unknown as React.Dispatch<
      React.SetStateAction<ViewConfigurations<ViewItem> | undefined>
    >,
  };

  // Pending for view change from outside
  useEffect(() => {
    setViewType(initialViewType);
  }, [initialViewType]);
  // useEffect(()=> {
  //   setData(initialData)
  // }, [initialData])
  return (
    <ViewContext.Provider value={value}>
      {viewType === ViewTypeEnum.Kanban ? (
        <KanbanProvider
          data={data as unknown as KanbanItem[]}
          setData={
            setData as unknown as React.Dispatch<
              React.SetStateAction<KanbanItem[]>
            >
          }
          initialData={data as unknown as KanbanItem[]}
          initialConfigurations={
            configurations as unknown as ViewConfigurations<KanbanItem>
          }
          onUpdateFn={onUpdateFn as unknown as UpdateFunction}
          availableProperties={
            availableProperties as unknown as [keyof KanbanItem]
          }
          customComponents={
            customComponents as unknown as ViewCustomComponents<KanbanItem>
          }
        >
          {children}
        </KanbanProvider>
      ) : viewType === ViewTypeEnum.Table ? (
        <TableProvider
          columns={initialConfigurations.table.columns}
          data={data}
          setData={setData}
          emptyState={initialConfigurations.table.emptyState}
          configs={initialConfigurations.table.configs}
        >
          {children}
        </TableProvider>
      ) : viewType === ViewTypeEnum.Calendar ? (
        <CalendarProvider
          data={data as unknown as CalendarItem[]}
          setData={
            setData as unknown as React.Dispatch<
              React.SetStateAction<CalendarItem[]>
            >
          }
          customComponent={
            customComponents?.calendar as unknown as ViewCustomComponents<CalendarItem>['calendar']
          }
          preferences={initialPreferences}
          onUpdateFn={onUpdateFn as unknown as UpdateFunction}
        >
          {children}

        </CalendarProvider>
      ) : null}
    </ViewContext.Provider>
  );
};

// Custom hook to use the View Context
export const useViewContext = <T extends ViewItem>() => {
  const context = useContext(ViewContext);

  if (!context) {
    throw new Error('useViewContext must be used within a ViewProvider');
  }

  // Safely narrow down the context type
  return context as unknown as ViewContextProps<T>;
};
