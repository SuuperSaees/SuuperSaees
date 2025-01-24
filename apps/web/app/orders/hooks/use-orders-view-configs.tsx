'use client';

import { useState } from 'react';

import Link from 'next/link';

import { Columns3, LucideIcon, Table } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { useTranslation } from 'react-i18next';

import { ViewInitialConfigurations } from '~/(views)/view-config.types';
import { ViewItem, ViewTypeEnum } from '~/(views)/views.types';
import EmptyState from '~/components/ui/empty-state';
import { Option } from '~/components/ui/select';
import { useColumns } from '~/hooks/use-columns';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import { Order } from '~/lib/order.types';
import { User } from '~/lib/user.types';
import { formatString } from '~/utils/text-formatter';

import KanbanCard from '../components/kanban-card';
import { useUserOrderActions } from './user-order-actions';

// Types
export interface ViewOption extends Option {
  icon: LucideIcon;
}

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

const useOrdersViewConfigs = ({
  statuses,
  agencyRoles,
  currentUserRole,
  agencyMembers,
}: UseOrdersViewConfigsProps) => {
  // Hooks
  const [currentView, setCurrentView] = useState<string>(ViewTypeEnum.Table);
  const { orderDateMutation, orderAssignsMutation } = useUserOrderActions();
  const { t } = useTranslation('orders');

  // Helper functions
  const hasPermission = () => agencyRoles.has(currentUserRole);

  const createStatusConfig = (status: AgencyStatus.Type) => {
    if (status.deleted_on === null) {
      return {
        id: String(status.id) ?? '',
        key: status.status_name ?? '',
        name: formatString(status.status_name ?? '', 'lower'),
        position: status.position ?? 0,
        color: status.status_color ?? '',
        visible: true,
      }
    } return
  }

  // Components
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

  // View configurations
  const orderColumns = useColumns('orders', {
    data: { orderAgencyMembers: agencyMembers },
    actions: {
      updateOrderDate: orderDateMutation,
      updateOrderAssigns: orderAssignsMutation,
    },
    hasPermission,
  });

  const viewInitialConfiguarations: ViewInitialConfigurations<Order.Response> =
    {
      kanban: {
        group: {
          selected: 'status',
          values: statuses?.map(createStatusConfig).filter(val => val !== undefined),
          updateFn: (value: Order.Response) => Promise.resolve([value]),
        },
      },
      table: {
        columns: orderColumns,
        emptyState: <EmptyStateComponent />,
      },
    };

  const viewOptions: ViewOption[] = [
    {
      label: 'Board',
      value: 'kanban',
      action: (view: string | number) => setCurrentView(String(view)),
      icon: Columns3,
    },
    {
      label: 'Table',
      value: 'table',
      action: (view: string | number) => setCurrentView(String(view)),
      icon: Table,
    },
  ];

  // Custom components for ViewProvider
  const customComponents = {
    kanban: {
      Card: ({ item }: { item: ViewItem }) => (
        <KanbanCard item={item as Order.Response} />
      ),
    },
  };

  return {
    viewOptions,
    viewInitialConfiguarations,
    viewAvailableProperties: VIEW_AVAILABLE_PROPERTIES,
    currentView,
    customComponents,
    setCurrentView,
  };
};

export default useOrdersViewConfigs;
