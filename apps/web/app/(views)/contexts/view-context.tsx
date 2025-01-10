'use client';

import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

import useViewConfigurations from '../hooks/view/use-view-configurations';
import { KanbanItem } from '../kanban.types';
import { createFullConfiguration } from '../utils/views/data-transform';
import {
  ViewConfigurations,
  ViewInitialConfigurations,
} from '../view-config.types';
import { UpdateFunction, ViewCustomComponents, ViewItem, ViewType } from '../views.types';
import KanbanProvider from './kanban-context';

// Define the Context types
export interface ViewContextProps<T extends ViewItem> {
  viewType: ViewType;
  data: T[];
  configurations: ViewConfigurations<T>;
  availableProperties: [keyof T];
  manageConfigurations: {
    updateGroup: (groupKey: keyof T) => void;
  };
  customComponents?: ViewCustomComponents<T>; 
  setViewType: (viewType: ViewType) => void;
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  setConfigurations: React.Dispatch<
    React.SetStateAction<ViewConfigurations<T> | undefined>
  >;
  onAction?: (action: string, payload: T) => Promise<void | T>;
}

// Create a generic context
const ViewContext = createContext<ViewContextProps<ViewItem> | undefined>(
  undefined,
);

// Context provider
interface ViewProviderProps<T extends ViewItem> {
  children: ReactNode;
  initialData: T[];
  initialViewType: ViewType;
  initialConfigurations: ViewInitialConfigurations<T>;
  availableProperties: [keyof T];
  customComponents?: ViewCustomComponents<T>;
  onUpdateFn?: UpdateFunction;

}

export const ViewProvider = <T extends ViewItem>({
  children,
  initialData,
  initialViewType,
  initialConfigurations,
  availableProperties = ['status'] as [keyof T],
  customComponents,
  onUpdateFn
}: ViewProviderProps<T>) => {
  const newConfigurations = createFullConfiguration<T>(
    initialData,
    initialViewType,
    initialConfigurations,
    availableProperties,
  );

  const [viewType, setViewType] = useState<ViewType>(initialViewType);
  const [data, setData] = useState<T[]>([]);
  const [configurations, setConfigurations] = useState<
    ViewConfigurations<T> | undefined
  >(newConfigurations);

  const manageConfigurations = useViewConfigurations(
    configurations,
    setConfigurations,
  );
  // const updateConfigurations =

  const value: ViewContextProps<ViewItem> = {
    viewType,
    data,
    configurations: configurations as unknown as ViewConfigurations<ViewItem>,
    manageConfigurations,
    availableProperties: availableProperties as unknown as [keyof ViewItem],
    customComponents: customComponents as unknown as ViewCustomComponents<ViewItem>,
    setViewType,
    setData: setData as unknown as React.Dispatch<
      React.SetStateAction<ViewItem[]>
    >,
    setConfigurations: setConfigurations as unknown as React.Dispatch<
      React.SetStateAction<ViewConfigurations<ViewItem> | undefined>
    >,
  };

  useEffect(()=> {
    setData(initialData)
  }, [initialData])
  return (
    <ViewContext.Provider value={value}>
      <KanbanProvider
        initialData={data as unknown as KanbanItem[]}
        initialConfigurations={
          configurations as unknown as ViewConfigurations<KanbanItem>
        }
        onUpdateFn={onUpdateFn as unknown as UpdateFunction}
        availableProperties={availableProperties as unknown as [keyof KanbanItem]}
        customComponents={customComponents as unknown as ViewCustomComponents<KanbanItem>}
      >
        {children}
      </KanbanProvider>
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
