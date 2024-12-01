'use client';

import React, { useMemo, useState } from 'react';

import Link from 'next/link';

import { Search } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { ThemedTabTrigger } from 'node_modules/@kit/accounts/src/components/ui/tab-themed-with-settings';
import { useTranslation } from 'react-i18next';

import { Separator } from '@kit/ui/separator';
import { Tabs, TabsContent, TabsList } from '@kit/ui/tabs';

import EmptyState from '~/components/ui/empty-state';
import { useColumns } from '~/hooks/use-columns';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import { Order } from '~/lib/order.types';

import Table from '../../components/table/table';

type OrdersTableProps = {
  orders: Order.Response[];
  role: string;
  agencyStatuses?: AgencyStatus.Type[];
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

export function OrderList({ orders, role }: OrdersTableProps) {
  const { t } = useTranslation('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'open' | 'completed' | 'all'>(
    'open',
  );

  // hasPermission based on role
  const hasPermission = () => {
    return agencyRoles.has(role);
  };
  const orderColumns = useColumns('orders', hasPermission);

  const filteredOrders = useMemo(() => {
    const currentTab = tabsConfig.find((tab) => tab.key === activeTab);
    return orders.filter(
      (order) =>
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        currentTab?.filter(order),
    );
  }, [orders, activeTab, searchTerm]);

  const agencyRoles = new Set([
    'agency_owner',
    'agency_project_manager',
    'agency_member',
  ]);

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

  return (
    <main>
      <Tabs
        defaultValue={activeTab}
        onValueChange={(value: string) =>
          setActiveTab(value as 'open' | 'completed' | 'all')
        }
        className="bg-transparent"
      >
        <div className="mb-[24px] flex flex-wrap items-center gap-4">
          <TabsList className="gap-2 bg-transparent">
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
          <div className="ml-auto flex items-center gap-2">
            <div className="relative flex flex-1 md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <ThemedInput
                type="search"
                placeholder={t('searchPlaceholderTasks')}
                className="focus-visible:ring-none w-full rounded-xl bg-white pl-8 focus-visible:ring-0 md:w-[200px] lg:w-[320px]"
                value={searchTerm}
                onChange={(e: {
                  target: { value: React.SetStateAction<string> };
                }) => setSearchTerm(e.target.value)}
              />
            </div>
            {orders.length > 0 && (
              <Link href="/orders/create">
                <ThemedButton>{t('creation.title')}</ThemedButton>
              </Link>
            )}
          </div>
        </div>
        <Separator />
        <div className="mt-4">
          {tabsConfig.map((tab) => (
            <TabsContent key={tab.key} value={tab.key}>
              <Table
                data={filteredOrders}
                columns={orderColumns}
                filterKey={'title'}
                controllers={{
                  search: {
                    value: searchTerm,
                    setValue: setSearchTerm,
                  },
                }}
                emptyStateComponent={renderEmptyState()}
              />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </main>
  );
}
