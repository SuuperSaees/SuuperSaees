'use client';

import { type JSX, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { ThemedTabTrigger } from 'node_modules/@kit/accounts/src/components/ui/tab-themed-with-settings';
import { getServices } from 'node_modules/@kit/team-accounts/src/server/actions/services/get/get-services';
import { useTranslation } from 'react-i18next';

import { Tabs, TabsContent, TabsList } from '@kit/ui/tabs';

import FileSection from './files';
import MemberButtonTriggers from './member-button-triggers';
// import InvoiceSection from './invoices';
import MemberSection from './members';
import OrdersSection from './orders';
import { ServiceButtonTriggers } from './service-button-triggers';
// import ReviewSection from './reviews';
import ServiceSection from './services';
import { EmbedSection } from '~/embeds/components/embed-section';
import { getEmbeds } from '~/server/actions/embeds/embeds.action';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
import { BoxIcon } from 'lucide-react';

/**
 * @description This component is used to display the navigation tabs for the account settings page.
 */
function SectionView({
  clientOrganizationId,
  currentUserRole,
  agencyId,
}: {
  clientOrganizationId: string;
  currentUserRole: string;
  agencyId: string;
}) {
  const { t } = useTranslation('clients');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const { workspace: userWorkspace } = useUserWorkspace();
  const userId = userWorkspace.id ?? '';

  const services =
    useQuery({
      queryKey: ['organization-services', clientOrganizationId],
      queryFn: async () => await getServices(),
      enabled: activeTab === 'services',
    }) ?? [];

    console.log('agencyId', agencyId);
  const embedsQuery = useQuery({
    queryKey: ['organization-embeds', clientOrganizationId],
    queryFn: async () => await getEmbeds(clientOrganizationId),
    enabled: activeTab === 'embeds',
  })

  const embeds = embedsQuery.data ?? [];
  const serviceOptions = services?.data?.map((service) => {
    return { value: service.id, label: service.name };
  });

  // This is the actual path of the current folder
  // const [currentPath, setCurrentPath] = useState<{ title: string; uuid?: string }[]>([]); It's not used in the code for now

  const buttonControllersMap = new Map<string, JSX.Element | null>([
    ['orders', null],
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
    [
      'embeds',
      null
    ],
  ]);

  const availableTabsBasedOnRole = new Set([
    'agency_owner',
    'agency_member',
    'agency_project_manager',
  ]);
  const availableTabs = availableTabsBasedOnRole.has(currentUserRole)
    ? ['orders', 'members', 'services', 'files', 'embeds']
    : ['members', 'services', 'orders', 'embeds'];

    console.log('embeds', embeds);
  const navigationOptionsMap = new Map<string, JSX.Element>([
    [
      'orders',
      <OrdersSection key={'orders'} organizationId={clientOrganizationId} agencyId={agencyId}/>,
    ],
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
        agencyId={agencyId}
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
    [
      'embeds',
      <EmbedSection
        key={'embeds'}
        embeds={embeds}
        agencyId={agencyId}
        userId={userId}
        userRole={currentUserRole}
        defaultCreationValue={
          {
            title:'',
            value:'',
            location: 'tab',
            type: 'url',
            visibility: 'private',
            embed_accounts: [clientOrganizationId]
          }
        }
      />,
    ],

    // ['reviews', <ReviewSection key={'reviews'} />],
    // ['invoices', <InvoiceSection key={'invoices'} />],
  ]);

  const navigationOptionKeys = Array.from(navigationOptionsMap.keys()).filter(
    (key) => availableTabs.includes(key),
  );

  return (
    <Tabs
      defaultValue={navigationOptionKeys[0]}
      onValueChange={(value) => setActiveTab(value)}
      className="h-full"
    >
      <div className="flex justify-between">
        <TabsList className="gap-2 bg-transparent">
          {navigationOptionKeys.map((option) => (
            <ThemedTabTrigger
              activeTab={activeTab}
              option={option}
              value={option}
              key={option + 'tab'}
              className="font-semibold hover:bg-gray-200/30 hover:text-brand data-[state=active]:bg-brand-50/60 data-[state=active]:text-brand-900 flex items-center gap-2"
            >
                {
                  option === 'embeds' && (
                    <BoxIcon className='w-4 h-4' />
                  )
                }
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
