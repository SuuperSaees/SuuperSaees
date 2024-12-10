'use client';

import { useState } from 'react';

import { ThemedTabTrigger } from 'node_modules/@kit/accounts/src/components/ui/tab-themed-with-settings';

import { Tabs, TabsContent, TabsList } from '@kit/ui/tabs';
import { Trans } from '@kit/ui/trans';

import FileSection from '~/components/organization/files';

import ActivityPage from './activity';
import DetailsPage from './details';
import TasksSection from './tasks';
import CalendarSection from './calendar-section';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getOrderAgencyMembers } from '~/team-accounts/src/server/actions/orders/get/get-order';
import { UserWithSettings } from '~/lib/account.types';

type OrderTabsProps = {
  organizationId:
    | {
        account_id: string;
      }
    | undefined;
  currentPath: {
    title: string;
    uuid?: string;
  }[];
  userRole: string;
  orderId: string;
  orderAgencyId: string;
  agencyStatuses: AgencyStatus.Type[];  
  agencyName: string;
};


export const OrderTabs = ({ organizationId, currentPath, userRole, orderId, orderAgencyId, agencyStatuses, agencyName }: OrderTabsProps) => {
  const [activeTab, setActiveTab] = useState<'activity' | 'details'>(
    'activity',
  );

  const { data: orderAgencyMembers, isLoading } = useQuery<UserWithSettings[]>({
    queryKey: ['order-agency-members', orderId],
    queryFn: async () => {
      const data = await getOrderAgencyMembers(orderAgencyId, Number(orderId));
      return data;
    },
    staleTime: 1000 * 60 * 5,
    enabled:
      userRole === 'agency_owner' ||
      userRole === 'agency_member' ||
      userRole === 'agency_project_manager',
  }) as UseQueryResult<UserWithSettings[], unknown>;

  return (
    <Tabs
      className="flex max-h-full h-full flex-col gap-6 min-h-0"
      defaultValue={activeTab}
      onValueChange={(value: string) => {
        setActiveTab(value as 'activity' | 'details');
      }}
    >
      <TabsList className="flex w-fit gap-2 bg-transparent px-8">
        <ThemedTabTrigger
          value="activity"
          activeTab={activeTab}
          option={'activity'}
        >
          <Trans i18nKey={'orders:details.navigation.activity'} />
        </ThemedTabTrigger>
        <ThemedTabTrigger
          value="details"
          activeTab={activeTab}
          option={'details'}
        >
          <Trans i18nKey={'orders:details.navigation.details'} />
        </ThemedTabTrigger>
        <ThemedTabTrigger 
          value="tasks" 
          activeTab={activeTab} 
          option={'tasks'}
          className='flex items-center gap-1'
        >
          <Trans i18nKey={'orders:details.navigation.tasks'} />
          {/* <TaskCounter
            taskCount={countIncompleteTasks(tasks)}
          /> */}
        </ThemedTabTrigger>
        <ThemedTabTrigger 
          value="files" 
          activeTab={activeTab} 
          option={'files'}
        >
          <Trans i18nKey={'orders:details.navigation.files'} />
        </ThemedTabTrigger>
        <ThemedTabTrigger 
          value="calendar" 
          activeTab={activeTab} 
          option={'calendar'}
        >
          <Trans i18nKey={'account:calendar'} />
        </ThemedTabTrigger>
      </TabsList>

      <TabsContent
        value="details"
        className="no-scrollbar h-full max-h-full min-h-0 overflow-y-auto px-8"
      >
        <DetailsPage />
      </TabsContent>
      <TabsContent value="activity" className="h-full max-h-full min-h-0">
        <ActivityPage agencyName={agencyName} />
      </TabsContent>
      <TabsContent value="tasks">
        <div className="w-full px-8">
          <TasksSection 
            userRole={userRole}
            orderId={orderId}
            orderAgencyId={orderAgencyId}
            agencyStatuses={agencyStatuses}
          />
        </div>
      </TabsContent>
      <TabsContent value="files">
        <div className="w-full px-8">
          <FileSection
            key={'files'}
            clientOrganizationId={organizationId?.account_id ?? ''}
            currentPath={currentPath}
          />
        </div>
      </TabsContent>
      <TabsContent value="calendar">
        <div className="w-full px-8">
          <CalendarSection 
            orderAgencyMembers={orderAgencyMembers ?? []}
            loading={isLoading}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};
