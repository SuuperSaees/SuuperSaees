'use client';

import { useMemo, useState, useEffect } from 'react';

import Link from 'next/link';

import { Search } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { ThemedTabTrigger } from 'node_modules/@kit/accounts/src/components/ui/tab-themed-with-settings';
import { useTranslation } from 'react-i18next';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
import { Tabs, TabsContent, TabsList } from '@kit/ui/tabs';

import EmptyState from '~/components/ui/empty-state';
import { useColumns } from '~/hooks/use-columns';
import { UserWithSettings } from '~/lib/account.types';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import { Order } from '~/lib/order.types';

import Table from '../../components/table/table';
import { useUserOrderActions } from '../hooks/user-order-actions';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { deleteToken } from '~/team-accounts/src/server/actions/tokens/delete/delete-token';

type OrdersTableProps = {
  orders: Order.Response[];
  agencyMembers: UserWithSettings[];
  agencyStatuses?: AgencyStatus.Type[];
};

export function OrderList({ orders, agencyMembers }: OrdersTableProps) {
  const { t } = useTranslation('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'open' | 'completed' | 'all'>(
    'open',
  );
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const { workspace } = useUserWorkspace();
  const role = workspace?.role ?? '';
  // hasPermission based on role
  const hasPermission = () => {
    return agencyRoles.has(role);
  };

  const signOut = useSignOut();
  const handleSignOut = async () => {
    const impersonatingTokenId = localStorage.getItem("impersonatingTokenId");
    if (impersonatingTokenId){
      localStorage.removeItem('impersonatingTokenId');
      await deleteToken(impersonatingTokenId);
    }
    await signOut.mutateAsync()
  }

  const { orderDateMutation, orderAssignsMutation } = useUserOrderActions();

  const actions = {
    updateOrderDate: orderDateMutation,
    updateOrderAssigns: orderAssignsMutation,
  };
  const columnsAdditionalData = {
    orderAgencyMembers: agencyMembers,
  };
  const orderColumns = useColumns('orders', {
    data: columnsAdditionalData,
    actions,
    hasPermission: hasPermission,
  });

  const filteredOrders = useMemo(() => {
    const currentTab = tabsConfig.find((tab) => tab.key === activeTab);
    return orders.filter((order) => {
      const matchesSearchAndTab = 
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        currentTab?.filter(order);
  
      const selectedTagIds = activeFilters?.tags ?? '';
      const matchesTags = !selectedTagIds || 
        order.tags?.some(tagObj => 
          tagObj.tag?.id === selectedTagIds
        );
  
      return matchesSearchAndTab && matchesTags;
    });
  }, [orders, activeTab, searchTerm, activeFilters]);

  const renderEmptyState = () => (
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

  const controller = {
    search: {
      value: searchTerm,
      setValue: setSearchTerm,
    },
  };

  const agencyRoles = new Set([
    'agency_owner',
    'agency_project_manager',
    'agency_member',
  ]);

  useEffect(() => {
   if(role === 'client_guest' && orders.length === 0){
    void handleSignOut();
   }
  }, []);

  const getFilterableColumns = (): (keyof Order.Response)[] => {
    const baseColumns: (keyof Order.Response)[] = ['status', 'priority'];
    return hasPermission() ? [...baseColumns, 'tags'] : baseColumns;
  };
  return (
    <main>
      <Tabs
        defaultValue={activeTab}
        onValueChange={(value: string) =>
          setActiveTab(value as 'open' | 'completed' | 'all')
        }
        className="bg-transparent"
      > 
      <div className="mt-4">
          {tabsConfig.map((tab) => (
            <TabsContent key={tab.key} value={tab.key}>
              <Table
                data={filteredOrders}
                columns={orderColumns}
                filterKey={'title'}
                controllers={controller}
                emptyStateComponent={renderEmptyState()}
                presetFilters={{
                  filterableColumns: getFilterableColumns(),
                }}
                controllerBarComponents={{
                  search: (
                    <SearchComponent
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      t={t}
                    />
                  ),
                  add: <AddButton t={t} hasOrders={orders.length > 0} />,
                  other: (
                    <OtherComponents
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      t={t}
                    />
                  ),
                  config: {
                    filters: {
                      position: 3,
                    },
                    add: {
                      position: 4,
                    },
                    other: {
                      position: 1,
                    },
                    search: {
                      position: 2,
                    },
                  },
                }}
              />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </main>
  );
}

const SearchComponent = ({
  searchTerm,
  setSearchTerm,
  t,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  t: (key: string) => string;
}) => {
  return (
    <div className="relative flex flex-1 md:grow-0">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <ThemedInput
        type="search"
        placeholder={t('searchPlaceholderTasks')}
        className="focus-visible:ring-none w-full rounded-xl bg-white pl-8 focus-visible:ring-0 md:w-[200px] lg:w-[320px]"
        value={searchTerm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchTerm(e.target.value)
        }
      />
    </div>
  );
};

const AddButton = ({
  t,
  hasOrders,
}: {
  t: (key: string) => string;
  hasOrders: boolean;
}) => {
  return (
    <>
      {hasOrders && (
        <Link href="/orders/create">
          <ThemedButton>{t('creation.title')}</ThemedButton>
        </Link>
      )}
    </>
  );
};

const OtherComponents = ({
  activeTab,
  t,
}: {
  activeTab: 'open' | 'completed' | 'all';
  setActiveTab: (tab: 'open' | 'completed' | 'all') => void;
  t: (key: string) => string;
}) => {
  return (
    <TabsList className="gap-2 bg-transparent mr-auto">
      {tabsConfig.map((tab) => (
        <ThemedTabTrigger
          key={tab.key}
          value={tab.key}
          activeTab={activeTab}
          option={tab.key}
          className="font-semibold hover:bg-gray-200/30 hover:text-brand data-[state=active]:bg-brand-50/60 data-[state=active]:text-brand-900"
        >
          {t(tab.label)}
        </ThemedTabTrigger>
      ))}
    </TabsList>
  );
};

const tabsConfig = [
  {
    key: 'open',
    label: 'openOrders',
    filter: (order: Order.Response) =>
      order.status !== 'completed' && order.status !== 'anulled',
  },
  {
    key: 'completed',
    label: 'completedOrders',
    filter: (order: Order.Response) => order.status === 'completed',
  },
  { key: 'all', label: 'allOrders', filter: () => true },
];
