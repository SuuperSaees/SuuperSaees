'use client';

import { type JSX, useEffect, useMemo, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';
import { BoxIcon } from 'lucide-react';
import { ThemedTabTrigger } from 'node_modules/@kit/accounts/src/components/ui/tab-themed-with-settings';
import { getServices } from 'node_modules/@kit/team-accounts/src/server/actions/services/get/get-services';
import { useTranslation } from 'react-i18next';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
import { Tabs, TabsContent, TabsList } from '@kit/ui/tabs';

import { EmbedSection } from '~/embeds/components/embed-section';
import { getEmbeds } from '~/server/actions/embeds/embeds.action';

import ButtonPinOrganization from './button-pin-organization';
import FileSection from './files';
import MemberButtonTriggers from './member-button-triggers';
import MemberSection from './members';
import OrdersSection from './orders';
import { ServiceButtonTriggers } from './service-button-triggers';
import ServiceSection from './services';

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
    // Always fetch embeds to check if we need to show embed tabs
    enabled: true,
  });

  const embeds = useMemo(() => embedsQuery.data ?? [], [embedsQuery.data]);
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
    ['new', null], // Add controller for the "new embed" tab
  ]);

  // Add embed IDs to button controllers map
  embeds.forEach(embed => {
    buttonControllersMap.set(embed.id, null);
  });

  // Define base tabs that are always available
  const baseTabs = availableTabsBasedOnRole.has(currentUserRole)
    ? ['orders', 'members', 'services', 'files']
    : ['members', 'services', 'orders'];

  // Determine if we should include embed tabs
  const shouldIncludeEmbedTabs = sections 
    ? Boolean(sections.includes('embeds'))
    : availableTabsBasedOnRole.has(currentUserRole);
    
  // Add "new" tab for creating embeds if embeds functionality is enabled
  const embedTabs = shouldIncludeEmbedTabs
    ? ['new'].concat(embeds.map(embed => embed.id))
    : [];
  
  // Combine all available tabs
  const availableTabs = sections 
    ? sections.filter(section => section !== 'embeds').concat(embedTabs)
    : baseTabs.concat(embedTabs);

  // Create the default embed creation values once
  const defaultEmbedCreationValue = useMemo(() => ({
    created_at: new Date().toISOString(),
    deleted_on: null,
    icon: null,
    id: '',
    location: 'tab' as const,
    organization_id: null,
    title: '',
    type: 'url' as const,
    updated_at: null,
    user_id: null,
    value: '',
    visibility: 'private' as const,
    embed_accounts: [clientOrganizationId],
  }), [clientOrganizationId]);

  // Prepare the embed section component for reuse
  const embedSectionComponent = useMemo(() => (
    <EmbedSection
      key={'embed-section'}
      embeds={embeds}
      agencyId={agencyId}
      userId={userId}
      userRole={currentUserRole}
      showEmbedSelector={true}
      queryKey={['organization-embeds', clientOrganizationId]}
      defaultCreationValue={defaultEmbedCreationValue}
      externalTabControl={true}
      activeEmbedId={activeTab}
    />
  ), [embeds, agencyId, userId, currentUserRole, clientOrganizationId, activeTab, defaultEmbedCreationValue]);

  // Add embed section component to navigation options
  const navigationOptionsMap = new Map<string, JSX.Element>([
    [
      'orders',
      <OrdersSection
        key={'orders'}
        organizationId={clientOrganizationId}
        agencyId={agencyId}
        showCardStats={showCardStats}
      />,
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
    // Add new embed creation as its own tab
    ['new', embedSectionComponent],
  ]);

  // Add each embed as its own tab
  embeds.forEach(embed => {
    navigationOptionsMap.set(embed.id, embedSectionComponent);
  });

  // Filtrar navigationOptionKeys para incluir solo las secciones disponibles
  const navigationOptionKeys = Array.from(navigationOptionsMap.keys()).filter(
    (key) => availableTabs.includes(key),
  );

  // Create a list of all tabs to display - memoized to prevent unnecessary re-renders
  const allTabs = useMemo(() => {
    return [...navigationOptionKeys];
  }, [navigationOptionKeys]);

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

  // Function to get appropriate label for embed tabs
  const getTabLabel = (option: string) => {
    // For standard tabs, use translation
    if (['orders', 'members', 'services', 'files'].includes(option)) {
      return t(`organizations.${option}.title`)
        .split('')
        .map((char, index) => (index === 0 ? char.toUpperCase() : char))
        .join('');
    }
    
    // For "new" tab, show "Add Integration"
    if (option === 'new') {
      return 'Add Integration';
    }
    
    // For embed tabs, show the embed title
    const embed = embeds.find(e => e.id === option);
    return embed?.title ?? option;
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        console.log('Tab changed to:', value);
        setActiveTab(value);
      }}
      className={`h-full min-h-0 ${['new', ...embeds.map(e => e.id)].includes(activeTab) ? 'flex flex-col' : ''}`}
    >
      <div className="flex justify-between">
        <TabsList className="gap-2 bg-transparent">
          {navigationOptionKeys.map((option) => (
            <ThemedTabTrigger
              activeTab={activeTab}
              option={option}
              value={option}
              key={option + 'tab'}
              className="flex items-center gap-2 font-semibold hover:bg-gray-200/30 hover:text-brand data-[state=active]:bg-brand-50/60 data-[state=active]:text-brand-900"
            >
              {(['new', ...embeds.map(e => e.id)].includes(option)) && <BoxIcon className="h-4 w-4" />}
              {getTabLabel(option)}
            </ThemedTabTrigger>
          ))}
        </TabsList>
        <div className="flex gap-4 items-center">
          {availableTabsBasedOnRole.has(currentUserRole) && (
            <ButtonPinOrganization organizationId={clientOrganizationId} />
          )}
          {buttonControllersMap.get(activeTab)}
        </div>
      </div>

      {/* Tab contents */}
      {Array.from(navigationOptionsMap.entries()).map(([key, option]) => (
        <TabsContent
          value={key}
          className={`max-h-full min-h-0 w-full border-t py-8 ${
            ['new', ...embeds.map(e => e.id)].includes(key) ? 'overflow-hidden flex-1' : ''
          }`}
          key={key + 'content'}
        >
          {option}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default SectionView;
