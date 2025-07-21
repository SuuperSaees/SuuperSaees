'use client';

import type { Dispatch, SetStateAction } from 'react';

import { Embeds } from '~/lib/embeds.types';
import { Order } from '~/lib/order.types';

import { PageHeader } from '../../../components/page-header';
import { TimerContainer } from '../../../components/timer-container';
import { ValueFormatters } from '../hooks/use-csv-export-formatters';
import { ViewOption } from '../hooks/use-orders-view-configs';
import CreateOrderButton from './create-order-button';
import Filters, { FilterGroup } from './filters';
import Search from './search';
import SettingsDropdown from './settings-dropdown';
import StatusFilters, { TabConfig } from './status-filters';
import ViewSelect from './view-select';
import WalletSummarySheet from '~/(credits)/components/wallet-summary-sheet';
import { usePathname } from 'next/navigation';
import { PaginationConfig } from '../../../components/shared/export-csv-button/types';

interface BoardHeaderProps {
  t: (key: string) => string;
  activeTab: string;
  handleTabChange: Dispatch<SetStateAction<string>>;
  tabsConfig: TabConfig[];
  embeds: Embeds.TypeWithRelations[];
  theme_color?: string;
  searchTerm: string;
  handleSearch: (searchTerm: string) => void;
  filtersConfig: FilterGroup[];
  filters: Record<string, string[]>;
  resetFilters: () => void;
  viewOptions: ViewOption[];
  currentView: string;
  ordersAreLoading: boolean;
  orders: Order.Response[];
  getValueFormatters: () => ValueFormatters;
  pagination?: PaginationConfig;
}

export function BoardHeader({
  t,
  activeTab,
  handleTabChange,
  tabsConfig,
  searchTerm,
  handleSearch,
  filtersConfig,
  filters,
  resetFilters,
  viewOptions,
  currentView,
  ordersAreLoading,
  orders,
  getValueFormatters,
  pagination,
}: BoardHeaderProps) {
  const pathname = usePathname();
  // const { workspace: userWorkspace } = useUserWorkspace();
  // const agencyRoles = [
  //   'agency_owner',
  //   'agency_project_manager',
  //   'agency_member',
  // ];
  const showTimerAndWallet = pathname !== '/organization'
  return (
    <div className="flex flex-col gap-5 w-full">
      <PageHeader title="orders:title" rightContent={
        <div className="flex items-center gap-4">
          {showTimerAndWallet && (
            <>
              <TimerContainer />
              <WalletSummarySheet />
            </>
          )}
          <CreateOrderButton
          t={t}
          hasOrders={orders.length > 0 || ordersAreLoading}
          className="sm:block hidden ml-auto"
        />
        </div>
      } className="w-full flex">
        <h2 className='text-xl font-medium leading-4'>{t('title')}</h2>
    
      </PageHeader>
      <div className="flex sm:flex-wrap flex-wrap-reverse items-center justify-end gap-2 sm:gap-4 relative w-full">

          <StatusFilters
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            t={t}
            tabsConfig={tabsConfig}
            className="mr-auto"
          />


        <Search
          defaultSearch={searchTerm}
          t={t}
          handleSearch={handleSearch}
        />

        <Filters
          filters={filtersConfig}
          defaultFilters={filters}
          onReset={resetFilters}
        />

        <ViewSelect options={viewOptions} defaultValue={currentView} />

        <SettingsDropdown
          disabled={ordersAreLoading}
          data={orders}
          t={t}
          allowedColumns={[
            'id',
            'title',
            'status',
            'priority',
            'created_at',
            'updated_at',
            'due_date',
            'customer',
            'assignations',
            'agency',
            'client_organization',
          ]}
          defaultFilename="projects.csv"
          defaultSelectedColumns={[
            'id',
            'title',
            'status',
            'priority',
            'created_at',
            'updated_at',
            'due_date',
            'customer',
            'client_organization',
          ]}
          columnHeaders={{
            id: t('columns.id'),
            title: t('columns.title'),
            status: t('columns.status'),
            priority: t('columns.priority'),
            created_at: t('columns.createdAt'),
            updated_at: t('columns.updatedAt'),
            due_date: t('columns.dueDate'),
            customer: t('columns.customer'),
            assignations: t('columns.assignedTo'),
            agency: t('columns.agency'),
            client_organization: t('columns.clientOrganization'),
          }}
          valueFormatters={
            getValueFormatters() as unknown as Record<
              string,
              (value: unknown) => string
            >
          }
          pagination={pagination}
        />

        <CreateOrderButton
          t={t}
          hasOrders={orders.length > 0 || ordersAreLoading}
          className="sm:hidden block"
        />
      </div>
    </div>
  );
}
