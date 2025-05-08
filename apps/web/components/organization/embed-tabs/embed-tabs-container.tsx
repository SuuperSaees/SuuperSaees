'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { EmbedSection } from '~/(main)/embeds/components/embed-section';
import { FormValues } from '~/(main)/embeds/schema';
import { Embeds } from '~/lib/embeds.types';

import { AddIntegrationTab, EmbedTab, StandardTab } from './embed-tab';
import { useEmbedTabs } from './use-embed-tabs';

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
      const embed = embeds.find((e) => e.id === id);
      if (embed) {
        // Get embed_accounts from the organizations
        const currentAccounts = embed.organizations?.map((org) => org.id) ?? [];

        const embedAccounts = currentAccounts.filter(
          (accountId: string) => accountId !== clientOrganizationId,
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
            embed_accounts: embedAccounts,
          } as unknown as FormValues;

          await embedSectionRef.current.handleEmbedUpdate(updateData, {
            isAccountRemoval: true,
          });
        }

        onTabDelete(id);
      }
    }
  };

  // Prepare the embed section component for reuse
  const embedSectionComponent = useMemo(
    () => (
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
    ),
    [
      embeds,
      agencyId,
      userId,
      currentUserRole,
      clientOrganizationId,
      activeTab,
      defaultEmbedCreationValue,
      embedSectionRef,
    ],
  );

  const ScrollableTabList: React.FC<{
    embedTabs: string[];
    embeds: Embeds.TypeWithRelations[];
    activeTab: string;
    handleDelete: (id: string) => void;
  }> = ({ embedTabs, embeds, activeTab, handleDelete }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(false);

    const checkScroll = () => {
      if (!scrollContainerRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth);
    };

    useEffect(() => {
      const scrollContainer = scrollContainerRef.current;
      if (scrollContainer) {
        checkScroll();
        scrollContainer.addEventListener('scroll', checkScroll);
        window.addEventListener('resize', checkScroll);

        return () => {
          scrollContainer.removeEventListener('scroll', checkScroll);
          window.removeEventListener('resize', checkScroll);
        };
      }
    }, []);

    const scroll = (direction: 'left' | 'right') => {
      if (!scrollContainerRef.current) return;
      const scrollAmount = 200;
      const container = scrollContainerRef.current;
      const newScrollLeft =
        direction === 'left'
          ? container.scrollLeft - scrollAmount
          : container.scrollLeft + scrollAmount;

      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    };

    const tabElements = embedTabs
      .map((id) => {
        if (id === 'new') {
          return <AddIntegrationTab key="new-tab" activeTab={activeTab} />;
        }

        const embed = embeds.find((e) => e.id === id);
        if (embed) {
          return (
            <EmbedTab
              key={`embed-${id}`}
              id={id}
              title={embed.title ?? ''}
              icon={embed.icon}
              activeTab={activeTab}
              onDelete={handleDelete}
              onEdit={(id) => {
                if (embedSectionRef.current?.handleEmbedEdit) {
                  embedSectionRef.current.handleEmbedEdit(id);
                }
              }}
            />
          );
        }

        return null;
      })
      .filter(Boolean);

    return (
      <div
        ref={scrollContainerRef}
        className="no-scrollbar relative flex h-full min-w-[250px] max-w-full overflow-x-auto border-l border-gray-300"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {showLeftButton && (
          <div className="sticky left-0 z-10 flex h-full items-stretch">
            <button
              onClick={() => scroll('left')}
              className="flex w-8 items-center justify-center bg-[#FFFFFF] shadow-lg backdrop-blur-[1px] hover:bg-[#FFFFFF]"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="flex items-center px-2 gap-2">{tabElements}</div>
        {showRightButton && (
          <div className="sticky right-0 z-10 flex h-full items-stretch">
            <button
              onClick={() => scroll('right')}
              className="flex w-8 items-center justify-center bg-[#FFFFFF] shadow-lg backdrop-blur-[1px] hover:bg-[#FFFFFF]"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Return components for rendering in TabsList
  const renderTabs = () => {
    return (
      <ScrollableTabList
        embedTabs={embedTabs}
        embeds={embeds}
        activeTab={activeTab}
        handleDelete={handleDelete}
      />
    );
  };

  // Return components for standard tabs
  const renderStandardTabs = (standardTabs: string[]) => {
    return standardTabs.map((option) => (
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
      embeds.forEach((embed) => {
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
    embedTabs,
    onTabDelete,
    handleDelete,
  };
}
