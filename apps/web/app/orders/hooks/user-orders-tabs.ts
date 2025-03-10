'use client';

import type React from 'react';
import { useCallback, useMemo, useState } from 'react';

import type { Embeds } from '~/lib/embeds.types';

interface UseTabsProps {
  organization: { embeds: Embeds.TypeWithRelations[] };
  getFilterValues: (key: string) => string[] | null;
}

export function useOrdersTabs({ organization, getFilterValues }: UseTabsProps) {
  // Get embeds that should be displayed as tabs
  const embeds = useMemo(
    () =>
      organization.embeds?.filter((embed) => embed.location === 'tab') ?? [],
    [organization.embeds],
  );

  // Compute initial active tab based on status filters
  const getInitialActiveTab = useCallback(() => {
    const statusFilterValues = getFilterValues('status');

    if (
      statusFilterValues?.length === 1 &&
      statusFilterValues.includes('completed')
    ) {
      return 'completed';
    }
    if (
      statusFilterValues &&
      !['annulled', 'completed'].includes(statusFilterValues.join(','))
    ) {
      return 'open';
    }
    return 'all';
  }, [getFilterValues]);

  const [activeTab, setActiveTab] = useState<string>(getInitialActiveTab());
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  // Create a wrapper function that matches the expected Dispatch<SetStateAction<string>> type
  const handleTabChange = useCallback(
    (value: React.SetStateAction<string>) => {
      // This function accepts both string values and function updaters
      const newValue = typeof value === 'function' ? value(activeTab ?? '') : value;
      setActiveTab(newValue);
    },
    [activeTab],
  );

  // Check if the active tab is an embed
  const isEmbedTab = useCallback(
    (tabId: string) => {
      return embeds.some((embed) => embed.id === tabId);
    },
    [embeds],
  );

  return {
    activeTab,
    hoveredTab,
    setHoveredTab,
    handleTabChange,
    isEmbedTab,
    embeds,
  };
}
