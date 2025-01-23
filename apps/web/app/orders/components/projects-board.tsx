'use client';

import { Dispatch, SetStateAction, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import Board from '~/(views)/components/board';
import KanbanSkeleton from '~/(views)/components/kanban/kanban-skeleton';
import TableSkeleton from '~/(views)/components/table/table-skeleton';
import { ViewProvider } from '~/(views)/contexts/view-context';
import { ViewInitialConfigurations } from '~/(views)/view-config.types';
import { UpdateFunction, ViewItem, ViewType } from '~/(views)/views.types';
import { Tags } from '~/lib/tags.types';
import { User } from '~/lib/user.types';

import useOrdersActionHandler from '../hooks/use-orders-action-handler';
import useOrdersAuthManagement from '../hooks/use-orders-auth-management';
import useOrdersFilterConfigs from '../hooks/use-orders-filter-configs';
import useOrdersTransformations from '../hooks/use-orders-transformations';
import useOrdersViewConfigs from '../hooks/use-orders-view-configs';
import { useAgencyStatuses } from './context/agency-statuses-context';
import { useOrdersContext } from './context/orders-context';
import CreateOrderButton from './create-order-button';
import Filters from './filters';
import Search from './search';
import StatusFilters from './status-filters';
import ViewSelect from './view-select';

// Types
interface ProjectsBoardProps {
  agencyMembers: User.Response[];
  tags: Tags.Type[];
}

// Constants
const PRIORITIES = [
  { id: '1', name: 'low', color: '#DCFAE6' },
  { id: '2', name: 'medium', color: '#fef7c3' },
  { id: '3', name: 'high', color: '#FEE4E2' },
];

const AGENCY_ROLES = new Set([
  'agency_owner',
  'agency_project_manager',
  'agency_member',
]);

const ProjectsBoard = ({ agencyMembers, tags }: ProjectsBoardProps) => {
  // Context and hooks
  const { orders, setOrders, agencyId, ordersAreLoading } = useOrdersContext();
  const { statuses } = useAgencyStatuses();
  const { t } = useTranslation('orders');
  const { workspace } = useUserWorkspace();
  const role = workspace.role ?? '';

  // State
  const { getClientUsers, getClientOrganizations } = useOrdersTransformations();

  // Custom hooks
  const {
    getFilterValues,
    resetFilters,
    filteredOrders,
    tabsConfig,
    filtersConfig,
    filters,
    searchConfig,
  } = useOrdersFilterConfigs({
    orders,
    tags,
    statuses,
    agencyMembers,
    priorities: PRIORITIES,
    clientMembers: getClientUsers(orders),
    clientOrganizations: getClientOrganizations(orders),
  });

  const {
    viewInitialConfiguarations,
    viewAvailableProperties,
    viewOptions,
    currentView,
    customComponents,
  } = useOrdersViewConfigs({
    agencyRoles: AGENCY_ROLES,
    statuses,
    currentUserRole: role,
    agencyMembers,
  });

  const { handleUpdateOrder } = useOrdersActionHandler({
    orders,
    setOrders,
    agencyId,
    statuses,
  });

  // Compute initial active tab
  const statusFilterValues = getFilterValues('status');
  const getInitialActiveTab = () => {
    if (
      statusFilterValues?.length === 1 &&
      statusFilterValues.includes('completed')
    ) {
      return 'completed';
    }
    if (
      statusFilterValues &&
      !['annulled', 'completed'].includes(statusFilterValues.join(','))
    ) {
      return 'open';
    }
    return 'all';
  };

  const [activeTab, setActiveTab] = useState(getInitialActiveTab());

  // Auth management
  useOrdersAuthManagement({
    role,
    hasOrders: orders.length > 0,
  });

  return (
    <ViewProvider
      initialData={filteredOrders as ViewItem[]}
      initialViewType={currentView as ViewType}
      initialConfigurations={
        viewInitialConfiguarations as unknown as ViewInitialConfigurations<ViewItem>
      }
      onUpdateFn={handleUpdateOrder as UpdateFunction}
      data={filteredOrders as ViewItem[]}
      setData={setOrders as Dispatch<SetStateAction<ViewItem[]>>}
      availableProperties={
        viewAvailableProperties as unknown as [keyof ViewItem]
      }
      customComponents={customComponents}
    >
      <div className="flex w-full flex-col gap-4">
        <div className="flex items-center justify-end gap-4">
          <StatusFilters
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            t={t}
            tabsConfig={tabsConfig}
          />
          <Search
            defaultSearch={getFilterValues('search')?.[0] ?? ''}
            t={t}
            handleSearch={searchConfig.filter}
          />
          <Filters
            filters={filtersConfig}
            defaultFilters={filters}
            onReset={resetFilters}
          />
          <ViewSelect options={viewOptions} defaultValue={currentView} />
          <CreateOrderButton
            t={t}
            hasOrders={orders.length > 0 || ordersAreLoading}
          />
        </div>
        {ordersAreLoading ? (
          currentView === 'kanban' ? (
            <KanbanSkeleton columns={5} />
          ) : (
            <TableSkeleton columns={9} rows={7} />
          )
        ) : (
          <Board />
        )}
      </div>
    </ViewProvider>
  );
};

export default ProjectsBoard;
