'use client';

import { useState } from 'react';

import { ThemedTabTrigger } from 'node_modules/@kit/accounts/src/components/ui/tab-themed-with-settings';

import { Tabs, TabsContent, TabsList } from '@kit/ui/tabs';
import { Trans } from '@kit/ui/trans';

import FileSection from '~/components/organization/files';

import ActivityPage from './activity';
import DetailsPage from './details';
import TasksSection from './tasks';
import { Task } from '~/lib/tasks.types';
import { TaskCounter } from 'node_modules/@kit/accounts/src/components/ui/tasks-cantity-themed-with-settings';
import { countIncompleteTasks } from '~/utils/task-counter';

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
  tasks: Task.Type[];
};

export const OrderTabs = ({ organizationId, currentPath, tasks }: OrderTabsProps) => {
  const [activeTab, setActiveTab] = useState<'activity' | 'details'>(
    'activity',
  );

  return (
    <Tabs
      className="flex h-full flex-grow flex-col gap-6"
      defaultValue={activeTab}
      onValueChange={(value: string) => {
        setActiveTab(value as 'activity' | 'details');
      }}
    >
      <TabsList className="flex w-fit gap-2 bg-transparent">
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
          <TaskCounter
            taskCount={countIncompleteTasks(tasks)}
          />
        </ThemedTabTrigger>
        <ThemedTabTrigger 
          value="files" 
          activeTab={activeTab} 
          option={'files'}
        >
          <Trans i18nKey={'orders:details.navigation.files'} />
        </ThemedTabTrigger>
      </TabsList>

      <TabsContent
        value="details"
        className="no-scrollbar h-full max-h-full min-h-0 overflow-y-auto"
      >
        <DetailsPage />
      </TabsContent>
      <TabsContent value="activity" className="h-full max-h-full min-h-0">
        <ActivityPage />
      </TabsContent>
      <TabsContent value="tasks">
        <div className="w-full">
          <TasksSection 
            tasks={tasks}
          />
        </div>
      </TabsContent>
      <TabsContent value="files">
        <div className="w-full">
          <FileSection
            key={'files'}
            clientOrganizationId={organizationId?.account_id ?? ''}
            currentPath={currentPath}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};
