'use client';

import React, { useMemo } from 'react';
import { EmbedTab, AddIntegrationTab, StandardTab } from './embed-tab';
import { EmbedSection } from '~/embeds/components/embed-section';
import { useEmbedTabs } from './use-embed-tabs';
import { FormValues } from '~/embeds/schema';

type EmbedTabsContainerProps = {
  clientOrganizationId: string;
  currentUserRole: string;
  agencyId: string;
  sections?: string[];
  activeTab: string;
  onTabDelete: (id: string) => void;
  getTabLabel: (option: string) => string;
};

export function EmbedTabsContainer({
  clientOrganizationId,
  currentUserRole,
  agencyId,
  sections,
  activeTab,
  onTabDelete,
  getTabLabel,
}: EmbedTabsContainerProps) {
  const {
    embeds,
    embedTabs,
    userId,
    embedSectionRef,
    defaultEmbedCreationValue,
    shouldIncludeEmbedTabs,
  } = useEmbedTabs({
    clientOrganizationId,
    sections,
    currentUserRole,
  });

  const handleDelete = async (id: string) => {
    if (embedSectionRef.current?.handleEmbedDelete) {
      // Instead of full deletion, update the embed to remove this organization
      const embed = embeds.find(e => e.id === id);
      if (embed) {
        // Get embed_accounts from the organizations
        const currentAccounts = embed.organizations?.map(org => org.id) ?? [];
        
        const embedAccounts = currentAccounts.filter(
          (accountId: string) => accountId !== clientOrganizationId
        );
        
        // If this is the last organization, then delete the embed
        // Otherwise just update the embed_accounts
        if (embedAccounts.length === 0) {
          await embedSectionRef.current.handleEmbedDelete(id);
        } else if (embedSectionRef.current.handleEmbedUpdate) {
          // Construct a minimal update object with just the needed fields
          const updateData = {
            id: embed.id,
            title: embed.title ?? '',
            location: embed.location ?? 'tab',
            type: embed.type ?? 'url',
            visibility: embed.visibility ?? 'private',
            value: embed.value ?? '',
            embed_accounts: embedAccounts
          } as unknown as FormValues;
          
          await embedSectionRef.current.handleEmbedUpdate(
            updateData,
            { isAccountRemoval: true }
          );
        }
        
        onTabDelete(id);
      }
    }
  };

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
      ref={embedSectionRef}
    />
  ), [embeds, agencyId, userId, currentUserRole, clientOrganizationId, activeTab, defaultEmbedCreationValue, embedSectionRef]);

  // Return components for rendering in TabsList
  const renderTabs = () => {
    return embedTabs.map(id => {
      if (id === 'new') {
        return <AddIntegrationTab key="new-tab" activeTab={activeTab} />;
      }
      
      const embed = embeds.find(e => e.id === id);
      if (embed) {
        return (
          <EmbedTab
            key={`embed-${id}`}
            id={id}
            title={embed.title ?? ''}
            icon={embed.icon}
            activeTab={activeTab}
            onDelete={handleDelete}
          />
        );
      }
      
      return null;
    }).filter(Boolean);
  };

  // Return components for standard tabs
  const renderStandardTabs = (standardTabs: string[]) => {
    return standardTabs.map(option => (
      <StandardTab
        key={`tab-${option}`}
        option={option}
        activeTab={activeTab}
        label={getTabLabel(option)}
      />
    ));
  };

  // Creates a map of tab IDs to their content components
  const getTabContents = () => {
    const contentMap = new Map<string, React.ReactNode>();
    
    // Add the embed section component for 'new' and all existing embeds
    if (shouldIncludeEmbedTabs) {
      contentMap.set('new', embedSectionComponent);
      embeds.forEach(embed => {
        contentMap.set(embed.id, embedSectionComponent);
      });
    }
    
    return contentMap;
  };

  return {
    renderTabs,
    renderStandardTabs,
    getTabContents,
    embeds,
    embedTabs
  };
} 