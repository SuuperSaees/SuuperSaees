'use client';

import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { ThemedTabTrigger } from 'node_modules/@kit/accounts/src/components/ui/tab-themed-with-settings';
import { Tabs, TabsContent, TabsList } from '@kit/ui/tabs';
import { Trans } from '@kit/ui/trans';
import { UserWithSettings } from '~/lib/account.types';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import { getOrderAgencyMembers } from '~/team-accounts/src/server/actions/orders/get/get-order';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import ActivityPage from './activity';

const DetailsPage = dynamic(() => import('./details'), {
  loading: () => <div className="flex h-full items-center justify-center"></div>,
  ssr: false
});

const TasksSection = dynamic(() => import('./tasks'), {
  loading: () => <div className="flex h-full items-center justify-center"></div>,
  ssr: false
});

const FileSection = dynamic(() => import('~/components/organization/files'), {
  loading: () => <div className="flex h-full items-center justify-center"></div>,
  ssr: false
});

const CalendarSection = dynamic(() => import('./calendar-section'), {
  loading: () => <div className="flex h-full items-center justify-center"></div>,
  ssr: false
});

type OrderTabsProps = {
  organizationId:
    | {
        account_id: string;
      }
    | undefined;
  currentPath: {
    title: string;
    id: string;
  }[];
  userRole: string;
  orderId: string;
  orderAgencyId: string;
  agencyStatuses: AgencyStatus.Type[];
  agencyName: string;
};

type TabType = 'activity' | 'details' | 'tasks' | 'files' | 'calendar';

export const OrderTabs = ({
  organizationId,
  currentPath,
  userRole,
  orderId,
  orderAgencyId,
  agencyStatuses,
  agencyName,
}: OrderTabsProps) => {

  const [activeTab, setActiveTab] = useState<TabType>('activity');
  
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

  const showCalendar =
    (!isLoading &&
      orderAgencyMembers?.some((member) => member.user_settings?.calendar)) ??
    false;

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabType);
  };  

  return (
    <Tabs
      className="flex h-full max-h-full min-h-0 flex-col gap-2"
      value={activeTab}
      onValueChange={handleTabChange}
    >
      <TabsList className="flex md:w-fit gap-2 bg-transparent md:px-6.5 px-0 overflow-x-auto w-full">
        <ThemedTabTrigger
          value="activity"
          activeTab={activeTab}
          option={'activity'}
          className='md:flex-none flex-1'
        >
          <Trans i18nKey={'orders:details.navigation.activity'} />
        </ThemedTabTrigger>
        <ThemedTabTrigger
          value="details"
          activeTab={activeTab}
          option={'details'}
          className='md:flex-none flex-1'
        >
          <Trans i18nKey={'orders:details.navigation.details'} />
        </ThemedTabTrigger>
        <ThemedTabTrigger
          value="tasks"
          activeTab={activeTab}
          option={'tasks'}
          className="flex items-center gap-1 md:flex-none flex-1"
        >
          <Trans i18nKey={'orders:details.navigation.tasks'} />
        </ThemedTabTrigger>
        <ThemedTabTrigger value="files" activeTab={activeTab} option={'files'}>
          <Trans i18nKey={'orders:details.navigation.files'} />
        </ThemedTabTrigger>
        {showCalendar ? (
          <ThemedTabTrigger
            value="calendar"
            activeTab={activeTab}
            option={'calendar'}
            className='md:flex-none flex-1'
          >
            <Trans i18nKey={'account:calendar'} />
          </ThemedTabTrigger>
        ) : null}
      </TabsList>

      <TabsContent
        value="details"
        className="no-scrollbar h-full max-h-full min-h-0 overflow-y-auto px-6.5"
      >
        {activeTab === 'details' && <DetailsPage />}
      </TabsContent>
      <TabsContent value="activity" className="h-full max-h-full min-h-0">
        {activeTab === 'activity' && (
          <ActivityPage
            agencyName={agencyName}
            agencyStatuses={agencyStatuses}
            activeTab={activeTab}
            agencyId={orderAgencyId}
            clientOrganizationId={organizationId?.account_id ?? ''}
          />
        )}
      </TabsContent>
      <TabsContent value="tasks">
        <div className="w-full px-6.5">
          {activeTab === 'tasks' && (
            <TasksSection
              userRole={userRole}
              orderId={orderId}
              orderAgencyId={orderAgencyId}
              agencyStatuses={agencyStatuses}
            />
          )}
        </div>
      </TabsContent>
      <TabsContent value="files">
        <div className="w-full px-6.5">
          {activeTab === 'files' && (
            <FileSection
              key={'files'}
              clientOrganizationId={organizationId?.account_id ?? ''}
              agencyId={orderAgencyId}
              currentPath={currentPath}
            />
          )}
        </div>
      </TabsContent>
      <TabsContent value="calendar">
        <div className="w-full px-6.5">
          {activeTab === 'calendar' && (
            <CalendarSection
              orderAgencyMembers={orderAgencyMembers ?? []}
            />
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};
