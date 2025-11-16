'use client';

import { useState } from 'react';

import { ThemedTabTrigger } from 'node_modules/@kit/accounts/src/components/ui/tab-themed-with-settings';

import { TabsContent, TabsList, Tabs as TabsProvider } from '@kit/ui/tabs';

import { useSection } from '~/contexts/section';

function Tabs({defaultActiveTab, filters}: {
  defaultActiveTab: string;
  filters?: string[];
}) {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  const { views, triggers} = useSection();
  const tabOptions = Array.from(views.keys()).filter((key) =>
    !filters?.includes(key),
  );

  return (
    <TabsProvider
      defaultValue={defaultActiveTab}
      onValueChange={(value) => setActiveTab(value)}
      className="h-full"
    >
      <div className="flex justify-between">
        <TabsList className="gap-2 bg-transparent">
          {tabOptions.map((option) => (
            <ThemedTabTrigger
              activeTab={activeTab}
              option={option}
              value={option}
              key={option + 'tab'}
              className="font-semibold hover:bg-gray-200/30 hover:text-brand data-[state=active]:bg-brand-50/60 data-[state=active]:text-brand-900"
            >
              {option
                .split('')
                .map((char, index) => (index === 0 ? char.toUpperCase() : char))
                .join('')}
            </ThemedTabTrigger>
          ))}
        </TabsList>
        <div className="flex gap-4">{triggers?.get(activeTab)}</div>
      </div>

      {Array.from(views.values()).map((option) => (
        <TabsContent
          value={option.key ?? ''}
          className="h-full max-h-full min-h-0 w-full border-t py-8"
          key={option.key + 'content'}
        >
          {option}
        </TabsContent>
      ))}
    </TabsProvider>
  );
}

export default Tabs;
