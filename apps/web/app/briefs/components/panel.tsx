'use client';

import { useState } from 'react';

import { ThemedTabTrigger } from 'node_modules/@kit/accounts/src/components/ui/tab-themed-with-settings';

import { Tabs, TabsContent, TabsList } from '@kit/ui/tabs';

import Widgets from './widgets';
import BriefCreationForm from './brief-creation-form';

export default function Panel() {
  const [activeTab, setActiveTab] = useState<'widgets' | 'settings'>('widgets');
  return (
    <Tabs
      className="border-l-1 border-slate-gray-300 flex h-full max-h-full w-full max-w-80 flex-col gap-4 overflow-y-auto border p-4"
      defaultValue={activeTab}
      onValueChange={(value: string) => {
        setActiveTab(value as 'widgets' | 'settings');
      }}
    >
      <TabsList className="flex w-full bg-transparent">
        <ThemedTabTrigger
          value="widgets"
          activeTab={activeTab}
          option={'widgets'}
          className="w-full rounded-none border-b-2 border-transparent data-[state=active]:border-b-brand data-[state=active]:bg-transparent"
        >
          {/* <Trans i18nKey={'orders:details.navigation.activity'} /> */}
          Wigets
        </ThemedTabTrigger>
        <ThemedTabTrigger
          value="settings"
          activeTab={activeTab}
          option={'settings'}
          className="w-full rounded-none border-b-2 border-transparent data-[state=active]:border-b-brand data-[state=active]:bg-transparent"
        >
          {/* <Trans i18nKey={'orders:details.navigation.details'} /> */}
          Settings
        </ThemedTabTrigger>
      </TabsList>

      <TabsContent value="widgets">
        <Widgets />
      </TabsContent>
      <TabsContent value="settings">
        <BriefCreationForm propietaryOrganizationId='' userRole='' />
      </TabsContent>
    </Tabs>
  );
}
