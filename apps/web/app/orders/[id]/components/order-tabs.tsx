'use client';

import { useState } from 'react';

import { ThemedTabTrigger } from 'node_modules/@kit/accounts/src/components/ui/tab-themed-with-settings';

import { Tabs, TabsContent, TabsList } from '@kit/ui/tabs';
import { Trans } from '@kit/ui/trans';

import ActivityPage from './activity';
import DetailsPage from './details';

export const OrderTabs = () => {
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
      </TabsList>
      <TabsContent value="details">
        <DetailsPage />
      </TabsContent>
      <TabsContent value="activity" className="h-full max-h-full min-h-0">
        <ActivityPage />
      </TabsContent>
    </Tabs>
  );
};
