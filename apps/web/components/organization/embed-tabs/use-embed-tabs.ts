'use client';

import { useRef, useMemo } from 'react';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
import { useQuery } from '@tanstack/react-query';
import { getEmbeds } from '~/server/actions/embeds/embeds.action';
import { EmbedSectionRef } from '~/embeds/components/embed-section';

/**
 * Custom hook for managing embed tabs
 */
export function useEmbedTabs({
  clientOrganizationId,
  sections,
  currentUserRole
}: {
  clientOrganizationId: string;
  sections?: string[];
  currentUserRole: string;
}) {
  const { workspace: userWorkspace } = useUserWorkspace();
  const userId = userWorkspace.id ?? '';
  const embedSectionRef = useRef<EmbedSectionRef>(null);

  // Fetch embed data
  const embedsQuery = useQuery({
    queryKey: ['organization-embeds', clientOrganizationId],
    queryFn: async () => {
      return await getEmbeds(clientOrganizationId);
    },
    // Always fetch embeds to check if we need to show embed tabs
    enabled: true,
  });

  const embeds = useMemo(() => embedsQuery.data ?? [], [embedsQuery.data])
  .filter(embed => embed.location === 'tab');

  // Determine if we should include embed tabs based on roles and sections
  const availableTabsBasedOnRole = new Set([
    'agency_owner',
    'agency_member',
    'agency_project_manager',
  ]);

  // Determine if we should include embed tabs - now always true if not explicitly excluded in sections
  const shouldIncludeEmbedTabs = sections 
    ? Boolean(sections.includes('embeds'))
    : true; // Show embed tabs for all roles
    
  // Add "new" tab for creating embeds only for agency roles
  const embedTabs = shouldIncludeEmbedTabs
    ? embeds.map(embed => embed.id).concat(
        availableTabsBasedOnRole.has(currentUserRole) ? ['new'] : []
      )
    : [];

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

  return {
    embeds,
    embedTabs,
    userId,
    embedSectionRef,
    defaultEmbedCreationValue,
    shouldIncludeEmbedTabs,
    isAgencyRole: availableTabsBasedOnRole.has(currentUserRole)
  };
} 