'use client';

import { useState } from 'react';
import { LucideIcon } from 'lucide-react';

import { ViewTypeEnum } from '../views.types';
import useStorageConfigs from '~/hooks/use-storage-configs';

export interface ViewOption {
  label: string;
  value: string;
  icon: LucideIcon;
  action: (view: string) => void;
}

interface ViewConfig extends Record<string, unknown> {
  currentView: string;
  table?: {
    rowsPerPage: number;
  };
  // Add more view-specific configurations as needed
}

/**
 * Hook for managing view configurations (table, kanban, calendar, etc.)
 * @param configKey - Unique identifier for the view configuration
 * @param viewOptions - Available view options
 * @returns Configuration and methods to update it
 */
export function useViewConfigs(configKey: string, viewOptions: ViewOption[]) {
  const defaultConfig: ViewConfig = {
    currentView: ViewTypeEnum.Table,
    table: {
      rowsPerPage: 10,
    },
  };

  // Custom validator for view configurations
  const validator = (config: unknown): boolean => {
    if (typeof config !== 'object' || config === null) return false;
    
    // Check if currentView is valid
    const viewConfig = config as Partial<ViewConfig>;
    if (typeof viewConfig.currentView !== 'string') return false;
    
    // Validate that the view is one of the available options
    const validViews = viewOptions.map(option => String(option.value));
    return validViews.includes(viewConfig.currentView);
  };

  const { configs, updateConfig } = useStorageConfigs<ViewConfig>(
    configKey,
    defaultConfig,
    validator
  );

  // Initialize current view from storage or default
  const [currentView, setCurrentView] = useState<string>(configs.currentView);

  // Update current view in state and storage
  const updateCurrentView = (view: string | number) => {
    const viewString = String(view);
    setCurrentView(viewString);
    updateConfig('currentView', viewString);
  };

  return {
    currentView,
    viewOptions: viewOptions.map(option => ({
      ...option,
      action: updateCurrentView,
    })),
    setCurrentView: updateCurrentView,
    configs,
    updateConfig,
  };
}

export default useViewConfigs; 