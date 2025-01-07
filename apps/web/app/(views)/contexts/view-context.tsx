'use client';
import React, { ReactNode, createContext, useContext, useState } from 'react';

import { ViewConfiguration, ViewItem, ViewType } from '../types';

// Define the Context types
interface ViewContextProps<T extends ViewItem> {
  viewType: ViewType;
  data: T[];
  columns?: string[];
  configuration?: ViewConfiguration<T>;
  setViewType: (viewType: ViewType) => void;
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  setConfiguration: React.Dispatch<React.SetStateAction<ViewConfiguration<T>>>;
  onAction?: (action: string, payload: T) => Promise<void | T>;
}

// Create a generic context
const ViewContext = createContext<ViewContextProps<ViewItem> | undefined>(
  undefined,
);

// Context provider
interface ViewProviderProps {
  children: ReactNode;
  initialData: ViewItem[];
  initialViewType: ViewType;
  initialColumns?: string[];
  initialConfiguration?: ViewConfiguration<ViewItem>;
}

export const ViewProvider = ({
  children,
  initialData,
  initialViewType,
  initialColumns,
  initialConfiguration,
}: ViewProviderProps) => {
  const [viewType, setViewType] = useState<ViewType>(initialViewType);
  const [data, setData] = useState<ViewItem[]>(initialData);
  const [columns, setColumns] = useState<string[]>(initialColumns ?? []);
  const [configuration, setConfiguration] =
    useState<ViewConfiguration<ViewItem>>(initialConfiguration ?? {});

  const value = {
    viewType,
    data,
    columns,
    configuration,
    setViewType,
    setData,
    setConfiguration,
    setColumns,
  };

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
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
