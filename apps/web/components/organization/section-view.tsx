'use client';

import React, { type JSX, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getServices } from 'node_modules/@kit/team-accounts/src/server/actions/services/get/get-services';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';

import { Tabs, TabsContent, TabsList } from '@kit/ui/tabs';

import { getEmbeds } from '~/server/actions/embeds/embeds.action';

// Import our new modular components
import { EmbedTabsContainer } from './embed-tabs';

import ButtonPinOrganization from './button-pin-organization';
import FileSection from './files';
import OrdersSection from './orders';
import ServiceSection from './services';
import { Spinner } from '@kit/ui/spinner';
import MemberSection from './members';
import InvoicesSection from './invoices';
import CreditsSection from './credits';

// Dynamically import button components
const MemberButtonTriggers = dynamic(() => import('./member-button-triggers'), {
  loading: () => <Spinner className="w-4 h-4" />,
  ssr: false
});

const ServiceButtonTriggers = dynamic(() => import('./service-button-triggers'), {
  loading: () => <Spinner className="w-4 h-4" />,
  ssr: false
});

/**
 * @description This component is used to display the navigation tabs for the account settings page.
 */
function SectionView({
  clientOrganizationId,
  currentUserRole,
  agencyId,
  sections,
  clientOrganizationName,
  showCardStats = true,
}: {
  clientOrganizationId: string;
  currentUserRole: string;
  agencyId: string;
  sections?: string[];
  clientOrganizationName: string;
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
    queryFn: async () => await getEmbeds(clientOrganizationId),
    // Always fetch embeds to check if we need to show embed tabs
    // enabled: true,
  });

  const embeds = (embedsQuery.data ?? []).filter(embed => embed.location === 'tab')
  const isEmbedsLoading = embedsQuery.isLoading;

  const serviceOptions = services?.data?.map((service) => {
    return { value: service.id, label: service.name };
  });

  // This is the actual path of the current folder
  // const [currentPath, setCurrentPath] = useState<{ title: string; uuid?: string }[]>([]); It's not used in the code for now

  const buttonControllersMap = new Map<string, JSX.Element | null>([
    ['orders', null],
    [
      'members',
      activeTab === 'members' ? (
        <MemberButtonTriggers
          clientOrganizationId={clientOrganizationId}
          currentUserRole={currentUserRole}
          key={'members'}
          search={search}
          setSearch={setSearch}
        />
      ) : null,
    ],
    [
      'services',
      activeTab === 'services' ? (
        <ServiceButtonTriggers
          key={'services'}
          serviceOptions={serviceOptions}
          clientOrganizationId={clientOrganizationId}
          isPending={services.isPending}
          currentUserRole={currentUserRole}
        />
      ) : null,
    ],
    ['files', null],
    ['reviews', null],
    ['invoices', null],
    ['credits', null],
    ['new', null], // Add controller for the "new embed" tab
  ]);

  // Add embed IDs to button controllers map
  embeds.forEach(embed => {
    buttonControllersMap.set(embed.id, null);
  });

  // Define base tabs that are always available
  const baseTabs = availableTabsBasedOnRole.has(currentUserRole)
    ? ['orders', 'members', 'services', 'files', 'invoices', 'credits']
    : ['members', 'services', 'orders', 'invoices', 'credits'];

  // Use our new EmbedTabsContainer to manage embed tabs
  const {
    renderTabs: renderEmbedTabs,
    renderStandardTabs,
    getTabContents,
    embedTabs,
    handleDelete,
  } = EmbedTabsContainer({
    clientOrganizationId,
    currentUserRole,
    agencyId,
    sections,
    activeTab,
    onTabDelete: (id: string) => {
      // If the deleted tab was active, switch to 'new'
      if (activeTab === id) {
        setActiveTab('new');
      }
    },
    getTabLabel: (option) => {
      // For standard tabs, use translation
      if (['orders', 'members', 'services', 'files', 'invoices', 'credits'].includes(option)) {
        return t(`organizations.${option}.title`)
          .split('')
          .map((char, index) => (index === 0 ? char.toUpperCase() : char))
          .join('');
      }
      return '';
    }
  });

  // Combine all available tabs - now embeds are always included regardless of role
  const availableTabs = sections 
    ? sections.filter(section => section !== 'embeds').concat(embedTabs)
    : baseTabs.concat(embedTabs);

  const currentPath = useMemo(() => {
    return [
      { title: clientOrganizationName, id: clientOrganizationId },
    ];
  }, [clientOrganizationId, clientOrganizationName]);

  // Add standard sections to the navigation options map
  const navigationOptionsMap = new Map<string, React.ReactNode>([
    [
      'orders',
      <OrdersSection
        key={'orders'}
        organizationId={clientOrganizationId}
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
        currentPath={currentPath}
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
      'invoices',
      <InvoicesSection
        key={'invoices'}
        clientOrganizationId={clientOrganizationId}
      />,
    ],
    [
      'credits',
      <CreditsSection
        key={'credits'}
        clientOrganizationId={clientOrganizationId}
        agencyId={agencyId}
      />,
    ]
  ]);

  // Add embed tab contents with loading state
  const embedContents = getTabContents();
  embedContents.forEach((content, key) => {
    navigationOptionsMap.set(key, isEmbedsLoading ? (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    ) : content);
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
    const action = searchParams.get('action');
    const embedId = searchParams.get('embedId');

    // Don't process embed actions if embeds are still loading
    if (isEmbedsLoading) {
      return;
    }

    // Handle spaces section with actions
    if (section === 'spaces') {
      if (action === 'create') {
        setActiveTab('new');
      } else if (action === 'edit' && embedId) {
        // Only set active tab if embed exists
        const embedExists = embedTabs.includes(embedId);
        if (embedExists) {
          setActiveTab(embedId);
        }
      } else if (action === 'delete' && embedId) {
        // Only process delete if embed exists
        const deleteTab = embedTabs.find(tab => tab === embedId);
        if (deleteTab) {
          setActiveTab(embedId);
          setTimeout(() => {
            void handleDelete(deleteTab);
          }, 100);
        }
      }
    }
    // Handle other sections as before
    else if (section && allTabs.includes(section)) {
      setActiveTab(section);
    }

    // Clear the URL parameters
    if (section ?? action ?? embedId) {
      const url = new URL(window.location.href);
      url.searchParams.delete('section');
      url.searchParams.delete('action');
      url.searchParams.delete('embedId');
      window.history.replaceState({}, '', url);
    }
  }, [searchParams, allTabs, embedTabs, handleDelete, isEmbedsLoading]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        setActiveTab(value);
      }}
      className={`h-full min-h-0 ${['new', ...embeds.map(e => e.id)].includes(activeTab) ? 'flex flex-col' : ''}`}
    >
      <div className="flex justify-between flex-wrap shrink gap-4">
        <TabsList className="gap-2 bg-transparent max-w-full">
          {/* Standard tabs */}
          {renderStandardTabs(baseTabs)}
          
          {/* Embed tabs with loading state */}
          {isEmbedsLoading ? (
            <Spinner className="w-4 h-4 text-gray-500" />
          ) : renderEmbedTabs()}
        </TabsList>
        <div className="flex gap-4 items-center">
          {availableTabsBasedOnRole.has(currentUserRole) && (
            <ButtonPinOrganization organizationId={clientOrganizationId} />
          )}
          {!isEmbedsLoading && buttonControllersMap.get(activeTab)}
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