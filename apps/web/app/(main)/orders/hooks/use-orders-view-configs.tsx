'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

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
import useStorageConfigs from '~/hooks/use-storage-configs';
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
import { useOrdersContext } from '../components/context/orders-context';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

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
export interface OrdersViewConfig extends Record<string, unknown> {
  // Required specific properties
  currentView: string;
  table?: {
    rowsPerPage: number;
  };
}

// Main Hook Implementation
const useOrdersViewConfigs = ({
  statuses,
  agencyRoles,
  currentUserRole,
  agencyMembers,
}: UseOrdersViewConfigsProps) => {
  const { theme_color } = useOrganizationSettings();
  const { 
    count, 
    hasNextPage,
    currentPage,
    totalPages,
    isOffsetBased, 
    loadNextPage, 
    goToPage,
    updateLimit,
    limit,
    isLoadingMore 
  } = useOrdersContext();
  
  // Destructure and use hooks
  const { orderDateMutation, orderAssignsMutation } = useUserOrderActions();
  const { t } = useTranslation('orders');

  // Define view options
  const viewOptions = useMemo(() => [
    {
      label: 'Board',
      value: 'kanban',
      icon: Columns3,
      action: (_: string) => null, // Will be replaced by useStorageConfigs
    },
    {
      label: 'Table',
      value: 'table',
      icon: Table2,
      action: (_: string) => null, // Will be replaced by useStorageConfigs
    },
    {
      label: 'Calendar',
      value: 'calendar',
      icon: Calendar,
      action: (_: string) => null, // Will be replaced by useStorageConfigs
    },
  ], []);

  // Custom validator for view configurations
  const validator = (config: unknown): boolean => {
    if (typeof config !== 'object' || config === null) return false;
    
    // Check if currentView is valid
    const viewConfig = config as Partial<OrdersViewConfig>;
    if (typeof viewConfig.currentView !== 'string') return false;
    
    // Validate that the view is one of the available options
    const validViews = viewOptions.map(option => String(option.value));
    return validViews.includes(viewConfig.currentView);
  };

  // Default configuration
  const defaultConfig: OrdersViewConfig = {
    currentView: ViewTypeEnum.Table,
    table: {
      rowsPerPage: 10,
    },
  };

  // Use our generic storage hook
  const { configs, updateConfig } = useStorageConfigs<OrdersViewConfig>(
    'orders-config',
    defaultConfig,
    validator
  );

  // Use the currentView directly from configs
  // This ensures we're always using the value from localStorage
  const [currentView, setCurrentView] = useState(configs.currentView);
  
  // Keep currentView in sync with configs
  useEffect(() => {
    setCurrentView(configs.currentView);
  }, [configs.currentView]);

  // Update current view in state and storage
  const updateCurrentView = useCallback((view: string | number) => {
    const viewString = String(view);
    updateConfig('currentView', viewString);
  }, [updateConfig]);

  // Configure view options with the update function
  const configuredViewOptions = useMemo(() => viewOptions.map(option => ({
    ...option,
    action: updateCurrentView,
  })), [viewOptions, updateCurrentView]);

  const { organization } = useUserWorkspace();
  const isCreditsEnabled = organization?.settings?.credits?.enable_credits;

  const canShowCreditColumn = () => isCreditsEnabled;
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
      canShowCreditColumn,
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
            onUpdate: (value: string) => {
              const newLimit = Number(value);
              updateLimit(newLimit); // Update the query limit via context
            },
            value: limit, // Use limit from context instead of configs.table?.rowsPerPage
          },
          pagination: {
            totalCount: count,
            hasNextPage: hasNextPage,
            currentPage: currentPage,
            totalPages: totalPages,
            isOffsetBased: isOffsetBased,
            onLoadMore: loadNextPage,
            goToPage: goToPage,
            isLoadingMore: isLoadingMore,
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
    viewOptions: configuredViewOptions,
    preferences,
    viewInitialConfiguarations,
    viewAvailableProperties: VIEW_AVAILABLE_PROPERTIES,
    currentView,
    customComponents,
    setCurrentView: updateCurrentView,
    configs,
    updateConfig,
  };
};

export default useOrdersViewConfigs;
