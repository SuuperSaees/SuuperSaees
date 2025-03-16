'use client';

import { type JSX, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';
import { ThemedTabTrigger } from 'node_modules/@kit/accounts/src/components/ui/tab-themed-with-settings';
import { getServices } from 'node_modules/@kit/team-accounts/src/server/actions/services/get/get-services';
import { useTranslation } from 'react-i18next';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

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
import { EmbedPreview } from '~/embeds/components/embed-preview';
import ButtonPinOrganization from './button-pin-organization';
/**
 * @description This component is used to display the navigation tabs for the account settings page.
 */
function SectionView({
  clientOrganizationId,
  currentUserRole,
  agencyId,
  sections,
  showCardStats = true,
}: {
  clientOrganizationId: string;
  currentUserRole: string;
  agencyId: string;
  sections?: string[];
  showCardStats?: boolean;
}) {
  const { t } = useTranslation('clients');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const { workspace: userWorkspace } = useUserWorkspace();
  const userId = userWorkspace.id ?? '';
  const searchParams = useSearchParams();

  // Define availableTabsBasedOnRole before it's used
  const availableTabsBasedOnRole = new Set([
    'agency_owner',
    'agency_member',
    'agency_project_manager',
  ]);

  const services =
    useQuery({
      queryKey: ['organization-services', clientOrganizationId],
      queryFn: async () => await getServices(),
      enabled: activeTab === 'services',
    }) ?? [];

  const embedsQuery = useQuery({
    queryKey: ['organization-embeds', clientOrganizationId],
    queryFn: async () => {
      // Return without type assertion to avoid linter errors
      return await getEmbeds(clientOrganizationId);
    },
    enabled: activeTab === 'embeds' || !availableTabsBasedOnRole.has(currentUserRole),
  });

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

  // Modificar la lógica para priorizar las secciones pasadas como prop
  const availableTabs = sections 
    ? sections 
    : availableTabsBasedOnRole.has(currentUserRole)
      ? ['orders', 'members', 'services', 'files', 'embeds']
      : ['members', 'services', 'orders'];

  const navigationOptionsMap = new Map<string, JSX.Element>([
    [
      'orders',
      <OrdersSection key={'orders'} organizationId={clientOrganizationId} agencyId={agencyId} showCardStats={showCardStats}/>,
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
        showEmbedSelector={availableTabs.includes('embeds')}
        defaultCreationValue={{
          created_at: new Date().toISOString(),
          deleted_on: null,
          icon: null,
          id: '',
          location: 'tab',
          organization_id: null,
          title: '',
          type: 'url',
          updated_at: null,
          user_id: null,
          value: '',
          visibility: 'private',
          embed_accounts: [clientOrganizationId]
        }}
      />,
    ], 


    // ['reviews', <ReviewSection key={'reviews'} />],
    // ['invoices', <InvoiceSection key={'invoices'} />],
  ]);

  // Filtrar navigationOptionKeys para incluir solo las secciones disponibles
  const navigationOptionKeys = Array.from(navigationOptionsMap.keys()).filter(
    (key) => availableTabs.includes(key),
  );

  // For non-agency roles, add individual embed tabs
  const isAgencyRole = availableTabsBasedOnRole.has(currentUserRole);
  
  // Create a list of all tabs to display - memoized to prevent unnecessary re-renders
  const allTabs = useMemo(() => {
    const tabs = [...navigationOptionKeys];
    
    // If not an agency role and we have embeds, add them as individual tabs
    if (!isAgencyRole && embeds.length > 0) {
      embeds.forEach(embed => {
        if (!tabs.includes(embed.id)) {
          tabs.push(embed.id);
        }
      });
    }
    
    return tabs;
  }, [navigationOptionKeys, isAgencyRole, embeds]);

  // Handle section query parameter to activate the appropriate tab
  useEffect(() => {
    const section = searchParams.get('section');
    if (section && allTabs.includes(section)) {
      setActiveTab(section);
    }
    
    // Clear the section parameter from the URL
    if (section) {
      const url = new URL(window.location.href);
      url.searchParams.delete('section');
      window.history.replaceState({}, '', url);
    }
  }, [searchParams, allTabs]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        console.log('Tab changed to:', value);
        setActiveTab(value);
      }}
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
          
          {/* Add individual embed tabs for non-agency roles */}
          {!isAgencyRole && embeds.map((embed) => (
            <TabsTrigger
              key={`embed-${embed.id}-tab`}
              value={embed.id}
              className="group flex items-center gap-2 text-sm transition-colors data-[state=active]:bg-[#F0F0F0] data-[state=inactive]:bg-transparent data-[state=active]:text-gray-600 data-[state=inactive]:text-gray-500"
            >
              <BoxIcon className="h-4 w-4" />
              <span>{embed.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex gap-4">{buttonControllersMap.get(activeTab)}</div>


        {availableTabsBasedOnRole.has(currentUserRole) && (
          <div>
            <ButtonPinOrganization organizationId={clientOrganizationId} />
          </div>
        )}
      </div>

      {/* Standard tab contents */}
      {Array.from(navigationOptionsMap.entries()).map(([key, option]) => (
        <TabsContent
          value={key}
          className="h-full max-h-full min-h-0 w-full border-t py-8"
          key={key + 'content'}
        >
          {option}
        </TabsContent>
      ))}

      {/* Individual embed tab contents for non-agency roles */}
      {!isAgencyRole && embeds.map((embed) => (
        <TabsContent
          value={embed.id}
          className="h-full max-h-full min-h-0 w-full border-t py-8"
          key={`embed-${embed.id}-content`}
        >
          <div className="flex h-full w-full">
            <div className="flex-1">
              <EmbedPreview embedSrc={embed.value} />
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default SectionView;
