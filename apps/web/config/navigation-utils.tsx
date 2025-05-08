'use client';
import React from 'react';

import { z } from 'zod';

import { NavigationConfigSchema } from '@kit/ui/navigation-schema';

import { DynamicEmoji } from '../app/components/shared/dynamic-emoji';
import { ClientOptionsDropdown } from '../app/(main)/home/(user)/_components/client-options-dropdown';
import {
  clientAccountGuestNavigationConfig,
  clientAccountNavigationConfig,
} from './client-account-navigation.config';
import { teamMemberAccountNavigationConfig } from './member-team-account-navigation.config';
import pathsConfig from './paths.config';
import { personalAccountNavigationConfig } from './personal-account-navigation.config';
import { EmbedOptionsDropdown } from '~/(main)/home/(user)/_components/embed-options-dropdown';
import { AddPinnedClientButton } from '~/(main)/home/(user)/_components/add-pinned-client-button';
import { AddClientButton } from '~/(main)/home/(user)/_components/add-client-button';

// Types
export type NavigationConfig = z.infer<typeof NavigationConfigSchema>;

// Define Avatar component props interface
export interface AvatarProps {
  src: string;
  alt: string;
  username?: string;
  className?: string;
  [key: string]: unknown;
}

export type Organization = {
  id: string;
  name: string;
  picture_url?: string;
};

export type Embed = {
  id: string;
  title: string | null;
  value: string;
  type: string;
  location: string;
  deleted_on?: string | null;
  visibility?: string;
  icon?: string;
  organizations?: Organization[];
};

export type UserRole =
  | 'agency_owner'
  | 'agency_member'
  | 'client_owner'
  | 'client_member'
  | 'client_guest';

/**
 * Determines if a dashboard URL should be shown based on user role and ID
 */
export function shouldShowDashboardUrl(
  dashboardUrl: string | null | undefined,
  userRole: string | null | undefined,
  userId: string | null | undefined,
): boolean {
  if (!dashboardUrl) return false;

  const clientRoles = new Set(['client_owner', 'client_member']);
  const urlHasUserIds = dashboardUrl.includes('userIds=');

  if (urlHasUserIds && clientRoles.has(userRole ?? '')) {
    const userIds =
      new URL(dashboardUrl).searchParams.get('userIds')?.split(',') ?? [];
    return userIds.includes(userId ?? '');
  }

  return true;
}

/**
 * Gets the base navigation config for a user role
 */
export function getBaseNavigationConfig(
  userRole: string | null | undefined,
): NavigationConfig {
  const isAgencyOwner = userRole === 'agency_owner';

  // For non-agency owners, filter out the clients path
  const getFilteredConfig = (config: NavigationConfig) => {
    if (isAgencyOwner) return config;

    // Filter client route for roles different than agency_owner
    return {
      ...config,
      routes: config.routes.map((item) => {
        if ('children' in item) {
          return {
            ...item,
            children: item.children.filter(
              (child) => child.path !== pathsConfig.app.clients,
            ),
          };
        }
        return item;
      }),
    };
  };

  // Select the appropriate config based on user role
  if (userRole === 'agency_member')
    return getFilteredConfig(teamMemberAccountNavigationConfig);
  if (userRole === 'client_owner' || userRole === 'client_member')
    return clientAccountNavigationConfig;
  if (userRole === 'client_guest') return clientAccountGuestNavigationConfig;
  return personalAccountNavigationConfig;
}

/**
 * Creates an icon component from an embed's icon property
 */
export function createEmbedIcon(embed: Embed) {
  return <DynamicEmoji emoji={embed.icon} fallback="🔗" className="w-4" />;
}

/**
 * Creates a navigation item for an embed
 */
export function createEmbedNavigationItem(embed: Embed, clientId: string, isClientView = false) {
  return {
    type: 'group' as const,
    label: embed.title ?? 'Embed',
    path: embed.type === 'url' ? embed.value : `/embeds/${embed.id}`,
    Icon: createEmbedIcon(embed),
    menu: !isClientView ? <EmbedOptionsDropdown embedId={embed.id} accountId={clientId} /> : undefined,
    collapsible: false,
    collapsed: false,
    children: [],
  };
}

/**
 * Adds client embeds to the navigation config
 */
export function addClientEmbedsToNavigation(
  baseConfig: NavigationConfig,
  embeds: Embed[],
): NavigationConfig {
  // Filter embeds by location === 'sidebar'
  const sidebarEmbeds = embeds.filter(embed => embed.location === 'sidebar');
  
  if (!sidebarEmbeds.length) return baseConfig;

  const routes = [...baseConfig.routes];

  // Add all embeds in a single section
  if (sidebarEmbeds.length > 0) {
    routes.push({
      type: 'section',
      section: true,
      label: 'Workspace',
      groups: sidebarEmbeds.map((embed) => createEmbedNavigationItem(embed, '', true)),
      menu: undefined,
    });
  }

  return NavigationConfigSchema.parse({
    ...baseConfig,
    routes,
  });
}

/**
 * Adds agency embeds to the navigation config with support for pinned clients
 */
export function addAgencyEmbedsToNavigation(
  baseConfig: NavigationConfig,
  embeds: Embed[],
  AvatarComponent: React.ComponentType<AvatarProps>,
  t: (t: string) => string,
  clientOrganizations?: Organization[]
): NavigationConfig {
  const routes = [...baseConfig.routes];

  // Separate public and private embeds
  const publicEmbeds = embeds.filter((embed) => embed.visibility === 'public');
  const privateEmbeds = embeds.filter((embed) => embed.visibility !== 'public');

  // Group embeds by client
  const clientEmbedsMap = new Map<
    string,
    { client: Organization; embeds: Embed[] }
  >();

  // Process private embeds by client
  if (privateEmbeds.length > 0) {
    privateEmbeds.forEach((embed) => {
      if (embed.organizations?.length) {
        embed.organizations.forEach((org) => {
          const entry = clientEmbedsMap.get(org.id);
          if (entry) {
            entry.embeds.push(embed);
          } else {
            clientEmbedsMap.set(org.id, { client: org, embeds: [embed] });
          }
        });
      }
    });
  }

  // Create navigation groups for each organization
  const clientGroups = (clientOrganizations ?? []).map((client) => {
    // Get client embeds if they exist
    const clientEntry = clientEmbedsMap.get(client.id);
    const clientEmbeds = clientEntry?.embeds ?? [];

    return {
      type: 'group' as const,
      path: `${pathsConfig.app.clients}/organizations/${client.id}`,
      label: client.name,
      menu: <ClientOptionsDropdown clientId={client.id} />,
      Icon: (
        <AvatarComponent
          src={client.picture_url ?? ''}
          alt={client.name}
          username={client.name}
          className="h-5 w-5 border-none [&>img]:object-contain"
        />
      ),
      collapsible: true,
      collapsed: false,
      children: [
        ...clientEmbeds,
        ...publicEmbeds
      ].map((embed) => createEmbedNavigationItem(embed, client.id)),
    };
  });

  // Always add the clients section
  routes.push({
    type: 'section',
    // path: pathsConfig.app.clients,
    section: true,
    label: t('common:sidebar.favoriteClients'),
    menu: <AddClientButton />,
    className: "text-xs font-normal text-muted-foreground",
    groups: clientGroups,
    children: <AddPinnedClientButton />
  });

  return NavigationConfigSchema.parse({
    ...baseConfig,
    routes,
  });
}

/**
 * Builds the complete navigation config with embeds and client organizations
 */
export function buildNavigationConfig(
  userRole: string | null | undefined,
  embeds: Embed[] | undefined,
  AvatarComponent: React.ComponentType<AvatarProps>,
  t: (t: string) => string,
  clientOrganizations?: Organization[]
): NavigationConfig {
  // Get base config
  const baseConfig = getBaseNavigationConfig(userRole);
  const allowedAgencyRoles = ['agency_owner', 'agency_project_manager'];
  // Add embeds based on user role
  const isClientRole = userRole?.startsWith('client_');
  
  try {
    if (isClientRole) {
      return addClientEmbedsToNavigation(baseConfig, embeds ?? []);
    } else if (allowedAgencyRoles.includes(userRole ?? '')) {
      return addAgencyEmbedsToNavigation(
        baseConfig,
        embeds ?? [],
        AvatarComponent,
        t,
        clientOrganizations,
      );
    } else {
      return baseConfig;
    }
  } catch (error) {
    console.error('Error building navigation config:', error);
    // Return the base config if there was an error
    return baseConfig;
  }
}
