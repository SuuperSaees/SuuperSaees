'use client';

import { useState } from 'react';

import Link from 'next/link';

// Lucide Icons
import { Calendar, Columns3, LucideIcon, Table2 } from 'lucide-react';
// Theming and Internationalization
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { useOrganizationSettings } from 'node_modules/@kit/accounts/src/context/organization-settings-context';
import { useTranslation } from 'react-i18next';

// Internal Type Definitions
import {
  ViewInitialConfigurations,
  ViewPreferences,
} from '~/(views)/view-config.types';
import { ViewItem, ViewTypeEnum } from '~/(views)/views.types';
// UI Components
import EmptyState from '~/components/ui/empty-state';
import { Option } from '~/components/ui/select';
// Hooks and Utilities
import { useColumns } from '~/hooks/use-columns';
// Type Definitions
import { AgencyStatus } from '~/lib/agency-statuses.types';
import { Order } from '~/lib/order.types';
import { User } from '~/lib/user.types';
import { formatString } from '~/utils/text-formatter';

import CalendarCard from '../components/calendar-card';
import CalendarCardMonth from '../components/calendar-card-month';
// Custom Components and Actions
import KanbanCard from '../components/kanban-card';
import { useUserOrderActions } from './user-order-actions';

// Enhanced Types
export interface ViewOption extends Option {
  icon: LucideIcon;
}

// Props Interface for the Hook
interface UseOrdersViewConfigsProps {
  statuses: AgencyStatus.Type[];
  agencyRoles: Set<string>;
  currentUserRole: string;
  agencyMembers: User.Response[];
}

// Constants
const VIEW_AVAILABLE_PROPERTIES = [
  'status',
  'brief',
  'assigned_to',
  'customer',
  'priority',
  'client_organization',
] as const;

// Type definition with index signature
interface OrdersViewConfig extends Record<string, unknown> {
  // Required specific properties
  currentView: string;
  table?: {
    rowsPerPage: number;
  };
}

class LocalStorageManager<T extends Record<string, unknown>> {
  private readonly key: string;

  constructor(key: string) {
    this.key = key;
  }

  save(config: T): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(config));
    } catch (error) {
      console.error(`Error saving ${this.key} to localStorage:`, error);
    }
  }

  get(): T | null {
    try {
      const config = localStorage.getItem(this.key);

      // Type guard to ensure the parsed value matches the expected type
      if (config) {
        const parsed = JSON.parse(config);
        return this.isValidConfig(parsed) ? parsed : null;
      }

      return null;
    } catch (error) {
      console.error(`Error reading ${this.key} from localStorage:`, error);
      return null;
    }
  }

  // Type guard method to validate the configuration
  private isValidConfig(config: unknown): config is T {
    // Validate the configuration
    return (
      typeof config === 'object' &&
      config !== null &&
      'currentView' in config &&
      typeof (config as T).currentView === 'string'
    );
  }

  clear(): void {
    try {
      localStorage.removeItem(this.key);
    } catch (error) {
      console.error(`Error clearing ${this.key} from localStorage:`, error);
    }
  }

  // New method to validate and clean invalid views
  validateAndCleanConfig(validViews: string[]): void {
    const config = this.get();
    if (!config) return;

    const currentView = config.currentView;
    if (typeof currentView === 'string' && !validViews.includes(currentView)) {
      // If current view is invalid, remove it and set to default table view
      const newConfig = {
        ...config,
        currentView: ViewTypeEnum.Table
      };
      this.save(newConfig);
    }
  }
}

// Create a typed localStorage manager for orders view configuration
const ordersConfigStorage = new LocalStorageManager<OrdersViewConfig>(
  'orders-config',
);

// Main Hook Implementation
const useOrdersViewConfigs = ({
  statuses,
  agencyRoles,
  currentUserRole,
  agencyMembers,
}: UseOrdersViewConfigsProps) => {
  // Type-safe update function
  const updateCurrentView = (view: string | number): void => {
    const viewString = String(view);
    setCurrentView(viewString);

    // Save to localStorage with proper typing
    ordersConfigStorage.save({
      ...ordersConfigStorage.get(),
      currentView: viewString,
    });
  };

  // Get valid views from viewOptions
  const viewOptions: ViewOption[] = [
    {
      label: 'Board',
      value: 'kanban',
      action: updateCurrentView,
      icon: Columns3,
    },
    {
      label: 'Table',
      value: 'table',
      action: updateCurrentView,
      icon: Table2,
    },
    {
      label: 'Calendar',
      value: 'calendar',
      action: updateCurrentView,
      icon: Calendar,
    },
  ];

  const validViews = viewOptions.map(option => String(option.value));

  // Validate stored view against valid views before initializing state
  ordersConfigStorage.validateAndCleanConfig(validViews);

  // Type-safe initialization from localStorage
  const [currentView, setCurrentView] = useState<string>(() => {
    const savedConfig = ordersConfigStorage.get();
    const savedView = savedConfig?.currentView;
    return validViews.includes(savedView ?? '') ? savedView ?? ViewTypeEnum.Table : ViewTypeEnum.Table;
  });

  const { theme_color } = useOrganizationSettings();
  // Destructure and use hooks
  const { orderDateMutation, orderAssignsMutation } = useUserOrderActions();
  const { t } = useTranslation('orders');

  // Permission check helper
  const hasPermission = () => agencyRoles.has(currentUserRole);

  // Create status configuration for view
  const createStatusConfig = (status: AgencyStatus.Type) => {
    if (status.deleted_on === null) {
      return {
        id: String(status.id) ?? '',
        key: status.status_name ?? '',
        name: formatString(status.status_name ?? '', 'lower'),
        position: status.position ?? 0,
        color: status.status_color ?? '',
        visible: true,
      };
    }
    return undefined;
  };

  // Empty State Component for when no orders exist
  const EmptyStateComponent = () => (
    <EmptyState
      title={t('startFirstOrderTitle')}
      description={t('startFirstOrderDescription')}
      imageSrc="/images/illustrations/Illustration-box.svg"
      button={
        <Link href="/orders/create">
          <ThemedButton>{t('creation.title')}</ThemedButton>
        </Link>
      }
    />
  );

  // Configure columns for the table view
  const orderColumns = useColumns('orders', {
    data: { orderAgencyMembers: agencyMembers },
    actions: {
      updateOrderDate: orderDateMutation,
      updateOrderAssigns: orderAssignsMutation,
    },
    hasPermission,
  });

  // Initial view configurations
  const viewInitialConfiguarations: ViewInitialConfigurations<Order.Response> =
    {
      kanban: {
        group: {
          selected: 'status',
          values: statuses
            ?.map(createStatusConfig)
            .filter((val) => val !== undefined),
          updateFn: (value: Order.Response) => Promise.resolve([value]),
        },
      },
      table: {
        columns: orderColumns,
        emptyState: <EmptyStateComponent />,
        configs: {
          rowsPerPage: {
            onUpdate: (value: string) =>
              ordersConfigStorage.save({
                currentView: currentView,
                table: {
                  rowsPerPage: Number(value),
                },
              }),
            value: ordersConfigStorage.get()?.table?.rowsPerPage ?? 10,
          },
        },
      },
    };

  // Custom components for different views
  const customComponents = {
    kanban: {
      Card: ({ item }: { item: ViewItem }) => (
        <KanbanCard item={item as Order.Response} />
      ),
    },
    calendar: {
      Card: ({ item }: { item: ViewItem }) => (
        <CalendarCard item={item as Order.Response & { color: string }} />
      ),
      CardMonth: ({ item }: { item: ViewItem }) => (
        <CalendarCardMonth item={item as Order.Response & { color: string }} />
      ),
    },
  };

  const preferences: ViewPreferences = {
    interfaceColors: {
      primary: theme_color ?? '#1A38D7',
    },
  };
  // Return all configurations and state
  return {
    viewOptions,
    preferences,
    viewInitialConfiguarations,
    viewAvailableProperties: VIEW_AVAILABLE_PROPERTIES,
    currentView,
    customComponents,
    setCurrentView: updateCurrentView,
  };
};

export default useOrdersViewConfigs;
