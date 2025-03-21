// CONFIG TYPES
import { ColumnDef } from '@tanstack/react-table';
import { ViewItem, ViewManageableProperty, ViewType } from './views.types';
import { ControllersProps } from '../components/table/table';
import { CustomConfigs } from '@kit/ui/data-table';

// Base config type for all views, group and filters
export type ViewConfiguaration<T extends ViewManageableProperty> = {
  title: string;
  options: T[];
  action: (value: T) => void;
};
// Visibility config type for all views
export type ViewVisiblityConfiguration =
  ViewConfiguaration<ViewManageableProperty>;

// Group by config type for all views
export type ViewGroupByConfiguration<T extends ViewItem> = {
  title: string;
  selected: keyof T;
  options: Array<keyof T>;
  action: (group: keyof T) => void;
};

// Filter config type for all views
export type ViewFilterConfiguration<T extends ViewItem> = {
  title: string;
  selected: keyof T;
  options: Array<keyof T>;
  action: (filter: keyof T, value: string) => void; // Include `value` for filtering logic.
};

// Sort config type for all views
export type ViewSortConfiguration<T extends ViewItem> = {
  title: string;
  selected: keyof T;
  options: Array<keyof T>;
  action: (order: 'asc' | 'desc') => void; // Focus on order, with logic elsewhere.
};

// initial configuration to construct the base configurations
export interface ViewInitialConfigurations<T extends ViewItem> {
  kanban: {
    group: {
      selected: keyof T;
      values: ViewManageableProperty[];
      updateFn: (value: T) => Promise<T[]>;
    };
  };
  table: {
    columns: ColumnDef<T>[];
    emptyState: React.ReactNode;
    controllers?: ControllersProps;
    configs?: CustomConfigs;
  }
}

// Base config type for all views
export interface ViewConfigurations<T extends ViewItem> {
  viewType: ViewType;
  group: {
    title: string;
    groupBy: ViewGroupByConfiguration<T>;
    visibility: {
      visible: ViewVisiblityConfiguration;
      hidden: ViewVisiblityConfiguration;
    };
  };
  properties: {
    title: string;
    visibility: {
      visible: ViewVisiblityConfiguration;
      hidden: ViewVisiblityConfiguration;
    };
  };
  filters?: ViewFilterConfiguration<T>;
  sort?: ViewSortConfiguration<T>;
}


// Preferences config type for all views
export interface ViewPreferences {
  interfaceColors: {
    primary: string;
  }
}
