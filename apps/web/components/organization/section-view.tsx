'use client';

import React, { type JSX, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getServices } from 'node_modules/@kit/team-accounts/src/server/actions/services/get/get-services';
import { useTranslation } from 'react-i18next';

import { Tabs, TabsContent, TabsList } from '@kit/ui/tabs';

import { getEmbeds } from '~/server/actions/embeds/embeds.action';

// Import our new modular components
import { EmbedTabsContainer } from './embed-tabs';

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

  // Use our new EmbedTabsContainer to manage embed tabs
  const {
    renderTabs: renderEmbedTabs,
    renderStandardTabs,
    getTabContents,
    embedTabs
  } = EmbedTabsContainer({
    clientOrganizationId,
    currentUserRole,
    agencyId,
    sections,
    activeTab,
    onTabDelete: (id) => {
      // If the deleted tab was active, switch to 'new'
      if (activeTab === id) {
        setActiveTab('new');
      }
    },
    getTabLabel: (option) => {
      // For standard tabs, use translation
      if (['orders', 'members', 'services', 'files'].includes(option)) {
        return t(`organizations.${option}.title`)
          .split('')
          .map((char, index) => (index === 0 ? char.toUpperCase() : char))
          .join('');
      }
      return '';
    }
  });

  // Combine all available tabs
  const availableTabs = sections 
    ? sections.filter(section => section !== 'embeds').concat(embedTabs)
    : baseTabs.concat(embedTabs);

  // Add standard sections to the navigation options map
  const navigationOptionsMap = new Map<string, React.ReactNode>([
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
  ]);

  // Add embed tab contents
  const embedContents = getTabContents();
  embedContents.forEach((content, key) => {
    navigationOptionsMap.set(key, content);
  });

  // Filter navigation option keys to include only the available tabs
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

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        console.log('Tab changed to:', value);
        setActiveTab(value);
      }}
      className={`h-full min-h-0 ${['new', ...embeds.map(e => e.id)].includes(activeTab) ? 'flex flex-col' : ''}`}
    >
      <div className="flex justify-between flex-wrap shrink gap-4">
        <TabsList className="gap-2 bg-transparent max-w-full">
          {/* Standard tabs */}
          {renderStandardTabs(baseTabs)}
          
          {/* Embed tabs */}
          {renderEmbedTabs()}
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
