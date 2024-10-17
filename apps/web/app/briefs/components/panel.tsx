'use client';

import { usePathname } from 'next/navigation';

import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { ThemedTabTrigger } from 'node_modules/@kit/accounts/src/components/ui/tab-themed-with-settings';
import { useTranslation } from 'react-i18next';

import { Spinner } from '@kit/ui/spinner';
import { Tabs, TabsContent, TabsList } from '@kit/ui/tabs';

import { useBriefsContext } from '../contexts/briefs-context';
import BriefCreationForm from './brief-creation-form';
import Widgets from './widgets';

export default function Panel() {
  const { onSubmit, briefMutation, form, activeTab, setActiveTab } =
    useBriefsContext();

  const { t } = useTranslation('briefs');

  const pathname = usePathname();
  const showWidgets = pathname === '/briefs/create' || pathname === '/briefs/update'; 

  if (!showWidgets) {
    return null;
  }

  return (
    <Tabs
      className="border-l-1 border-slate-gray-300 flex h-full max-h-full w-full max-w-80 flex-col gap-4 border p-4"
      defaultValue='widgets'
      value={activeTab}
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
          {t('creation.panel.widgets.title')}
        </ThemedTabTrigger>
        <ThemedTabTrigger
          value="settings"
          activeTab={activeTab}
          option={'settings'}
          className="w-full rounded-none border-b-2 border-transparent data-[state=active]:border-b-brand data-[state=active]:bg-transparent"
        >
          {t('creation.panel.settings.title')}
        </ThemedTabTrigger>
      </TabsList>

      <TabsContent
        value="widgets"
        className="h-full max-h-full shrink overflow-y-auto"
      >
        <Widgets />
      </TabsContent>
      <TabsContent
        value="settings"
        className="h-full max-h-full shrink overflow-y-auto"
      >
        <BriefCreationForm
          propietaryOrganizationId=""
          userRole=""
          showFormFields={false}
          showInfo
        />
      </TabsContent>

      <ThemedButton
        type="button"
        className="flex gap-2"
        onClick={async () => {
          setActiveTab('settings')
          await form.handleSubmit(onSubmit)();
        }}
      >
        <span>{t('creation.form.submit')}</span>
        {briefMutation.isPending && <Spinner className="h-5 w-5" />}
      </ThemedButton>
    </Tabs>
  );
}
