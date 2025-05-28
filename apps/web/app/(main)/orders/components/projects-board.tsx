'use client';

import {
  type Dispatch,
  type SetStateAction,
  useMemo,
} from 'react';

import { useOrganizationSettings } from 'node_modules/@kit/accounts/src/context/organization-settings-context';
import { useTranslation } from 'react-i18next';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import { ViewProvider } from '~/(views)/contexts/view-context';
import type { ViewInitialConfigurations } from '~/(views)/view-config.types';
import type {
  UpdateFunction,
  ViewItem,
  ViewTypeEnum,
} from '~/(views)/views.types';
import type { Tags } from '~/lib/tags.types';
import type { User } from '~/lib/user.types';

import useCSVExportFormatters from '../hooks/use-csv-export-formatters';
import useOrdersActionHandler from '../hooks/use-orders-action-handler';
import useOrdersAuthManagement from '../hooks/use-orders-auth-management';
import useOrdersFilterConfigs from '../hooks/use-orders-filter-configs';
import useOrdersTransformations from '../hooks/use-orders-transformations';
import useOrdersViewConfigs from '../hooks/use-orders-view-configs';
import { useOrdersTabs } from '../hooks/user-orders-tabs';
import { PRIORITIES } from '../utils/constants';
import { AGENCY_ROLES } from '../utils/constants';
import { BoardContent } from './board-content';
import { BoardHeader } from './board-header';
import { useAgencyStatuses } from './context/agency-statuses-context';
import { useOrdersContext } from './context/orders-context';

// Types
interface ProjectsBoardProps {
  agencyMembers: User.Response[];
  tags: Tags.Type[];
  className?: string;
  storageKey?: string;
}

const ProjectsBoard = ({
  agencyMembers,
  tags,
  className,
  storageKey = 'orders-filters',
}: ProjectsBoardProps) => {
  // Context and hooks
  const { orders, setOrders, agencyId, ordersAreLoading, queryKey, handleSearch, searchTerm } =
    useOrdersContext();
  const { statuses } = useAgencyStatuses();
  const { t } = useTranslation('orders');
  const { workspace, organization } = useUserWorkspace();
  const { theme_color } = useOrganizationSettings();
  const role = workspace.role ?? '';

  // Custom hooks
  const { getClientUsers, getClientOrganizations } = useOrdersTransformations();

  const {
    getFilterValues,
    resetFilters,
    filteredOrders,
    tabsConfig,
    filtersConfig,
    filters,
  } = useOrdersFilterConfigs({
    orders,
    tags,
    statuses,
    agencyMembers,
    priorities: PRIORITIES,
    clientMembers: getClientUsers(orders),
    clientOrganizations: getClientOrganizations(orders),
    storageKey,
  });

  // Get the view configurations from our enhanced hook
  const {
    viewInitialConfiguarations,
    viewAvailableProperties,
    customComponents,
    preferences,
    currentView,
    viewOptions,
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
    queryKey,
  });

  // Get CSV export formatters
  const { getValueFormatters } = useCSVExportFormatters(statuses, PRIORITIES);

  // Tab management
  const { activeTab, handleTabChange, isEmbedTab, embeds } = useOrdersTabs({
    organization,
    getFilterValues,
  });

  // Auth management
  useOrdersAuthManagement({
    role,
    hasOrders: orders.length > 0,
  });

  const mutedOrders = useMemo(() => {
    if (currentView === 'calendar') {
      return filteredOrders.map((order) => ({
        ...order,
        color: statuses.find((status) => status.id === order.status_id)
          ?.status_color,
      }));
    }
    return filteredOrders;
  }, [filteredOrders, currentView, statuses]);


  return (
    <ViewProvider
      initialData={mutedOrders as ViewItem[]}
      initialViewType={currentView as ViewTypeEnum}
      initialConfigurations={
        viewInitialConfiguarations as unknown as ViewInitialConfigurations<ViewItem>
      }
      onUpdateFn={handleUpdateOrder as UpdateFunction}
      data={mutedOrders as ViewItem[]}
      setData={setOrders as Dispatch<SetStateAction<ViewItem[]>>}
      availableProperties={
        viewAvailableProperties as unknown as [keyof ViewItem]
      }
      initialPreferences={preferences}
      customComponents={customComponents}
    >
      <div className="flex h-full max-h-full min-h-0 w-full flex-col gap-4">
        <BoardHeader
          t={t}
          activeTab={activeTab}
          handleTabChange={handleTabChange}
          tabsConfig={tabsConfig}
          embeds={embeds}
          theme_color={theme_color}
          searchTerm={searchTerm}
          handleSearch={handleSearch}
          filtersConfig={filtersConfig}
          filters={filters}
          resetFilters={resetFilters}
          viewOptions={viewOptions}
          currentView={currentView}
          ordersAreLoading={ordersAreLoading}
          orders={orders}
          getValueFormatters={getValueFormatters}
        />

        <BoardContent
          ordersAreLoading={ordersAreLoading}
          currentView={currentView}
          activeTab={activeTab}
          isEmbedTab={isEmbedTab}
          embeds={embeds}
          className={className}
        />
      </div>
    </ViewProvider>
  );
};

export default ProjectsBoard;
