'use client';

import React, { ReactNode, createContext, useContext, useState } from 'react';

import useViewConfigurations from '../hooks/view/use-view-configurations';
import { KanbanItem } from '../kanban.types';
import { createFullConfiguration } from '../utils/views/data-transform';
import {
  ViewConfigurations,
  ViewInitialConfigurations,
} from '../view-config.types';
import { ViewItem, ViewType } from '../views.types';
import KanbanProvider from './kanban-context';

// Define the Context types
export interface ViewContextProps<T extends ViewItem> {
  viewType: ViewType;
  data: T[];
  configurations: ViewConfigurations<T>;
  setViewType: (viewType: ViewType) => void;
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  setConfigurations: React.Dispatch<
    React.SetStateAction<ViewConfigurations<T> | undefined>
  >;
  manageConfigurations: {
    updateGroup: (groupKey: keyof T) => void;
  };
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
}

export const ViewProvider = <T extends ViewItem>({
  children,
  initialData,
  initialViewType,
  initialConfigurations,
}: ViewProviderProps<T>) => {
  const newConfigurations = createFullConfiguration<T>(
    initialData,
    initialViewType,
    initialConfigurations,
  );

  const [viewType, setViewType] = useState<ViewType>(initialViewType);
  const [data, setData] = useState<T[]>(initialData);
  const [configurations, setConfigurations] = useState<
    ViewConfigurations<T> | undefined
  >(newConfigurations);

  const manageConfigurations = useViewConfigurations(
    configurations,
    setConfigurations,
  );
  // const updateConfigurations =
  // console.log('configurations from ViewContext', configurations);
  const value: ViewContextProps<ViewItem> = {
    viewType,
    data,
    configurations: configurations as unknown as ViewConfigurations<ViewItem>,
    manageConfigurations,
    setViewType,
    setData: setData as unknown as React.Dispatch<
      React.SetStateAction<ViewItem[]>
    >,
    setConfigurations: setConfigurations as unknown as React.Dispatch<
      React.SetStateAction<ViewConfigurations<ViewItem> | undefined>
    >,
  };
  return (
    <ViewContext.Provider value={value}>
      <KanbanProvider
        initialData={data as unknown as KanbanItem[]}
        initialConfigurations={
          configurations as unknown as ViewConfigurations<KanbanItem>
        }
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
