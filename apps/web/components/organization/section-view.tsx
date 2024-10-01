'use client';

import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { ThemedTabTrigger } from 'node_modules/@kit/accounts/src/components/ui/tab-themed-with-settings';
import { getServices } from 'node_modules/@kit/team-accounts/src/server/actions/services/get/get-services';
import { useTranslation } from 'react-i18next';

import { Tabs, TabsContent, TabsList } from '@kit/ui/tabs';

import FileSection from './files';
import MemberButtonTriggers from './member-button-triggers';
// import InvoiceSection from './invoices';
import MemberSection from './members';
import { ServiceButtonTriggers } from './service-button-triggers';
// import ReviewSection from './reviews';
import ServiceSection from './services';

/**
 * @description This component is used to display the navigation tabs for the account settings page.
 */
function SectionView({
  clientOrganizationId,
  currentUserRole,
}: {
  clientOrganizationId: string;
  currentUserRole: string;
}) {
  const { t } = useTranslation('clients');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('members');

  const services =
    useQuery({
      queryKey: ['organization-services', clientOrganizationId],
      queryFn: async () => await getServices(),
      enabled: activeTab === 'services',
    }) ?? [];

  const serviceOptions = services?.data?.map((service) => {
    return { value: service.id, label: service.name };
  });

  // This is the actual path of the current folder
  // const [currentPath, setCurrentPath] = useState<{ title: string; uuid?: string }[]>([]); It's not used in the code for now

  const buttonControllersMap = new Map<string, JSX.Element | null>([
    [
      'members',
      <MemberButtonTriggers
        clientOrganizationId={clientOrganizationId}
        currentUserRole={currentUserRole}
        key={'members'}
        search={search}
        setSearch={setSearch}
      />,
    ],
    [
      'services',
      <ServiceButtonTriggers
        key={'services'}
        serviceOptions={serviceOptions}
        clientOrganizationId={clientOrganizationId}
        isPending={services.isPending}
        currentUserRole={currentUserRole}
      />,
    ],
    ['files', null],
    ['reviews', null],
    ['invoices', null],
  ]);

  const navigationOptionsMap = new Map<string, JSX.Element>([
    [
      'members',
      <MemberSection
        currentUserRole={currentUserRole}
        key={'members'}
        search={search}
        setSearch={setSearch}
        clientOrganizationId={clientOrganizationId}
      />,
    ],
    [
      'files',
      <FileSection
        key={'files'}
        clientOrganizationId={clientOrganizationId}
        // setCurrentPath={setCurrentPath}  it's not used in the code for now
      />,
    ],
    [
      'services',
      <ServiceSection
        key={'services'}
        organizationId={clientOrganizationId}
        currentUserRole={currentUserRole}
      />,
    ],
    // ['reviews', <ReviewSection key={'reviews'} />],
    // ['invoices', <InvoiceSection key={'invoices'} />],
  ]);

  return (
    <Tabs
      defaultValue={Array.from(navigationOptionsMap.keys())[0]}
      onValueChange={(value) => setActiveTab(value)}
      className="h-full"
    >
      <div className="flex justify-between">
        <TabsList className="gap-2 bg-transparent">
          {Array.from(navigationOptionsMap.keys()).map((option) => (
            <ThemedTabTrigger
              activeTab={activeTab}
              option={option}
              value={option}
              key={option + 'tab'}
              className="font-semibold hover:bg-gray-200/30 hover:text-brand data-[state=active]:bg-brand-50/60 data-[state=active]:text-brand-900"
            >
              {t(`organizations.${option}.title`)
                .split('')
                .map((char, index) => (index === 0 ? char.toUpperCase() : char))
                .join('')}
            </ThemedTabTrigger>
          ))}
        </TabsList>
        <div className="flex gap-4">{buttonControllersMap.get(activeTab)}</div>
      </div>

      {Array.from(navigationOptionsMap.values()).map((option) => (
        <TabsContent
          value={option.key ?? ''}
          className="h-full max-h-full min-h-0 w-full border-t py-8"
          key={option.key + 'content'}
        >
          {option}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default SectionView;
