import React from 'react';

import { Box, Link } from 'lucide-react';
import { z } from 'zod';

import { NavigationConfigSchema } from '@kit/ui/navigation-schema';

import { DynamicIcon } from '../app/components/shared/dynamic-icon';
import {
  clientAccountGuestNavigationConfig,
  clientAccountNavigationConfig,
} from './client-account-navigation.config';
import { teamMemberAccountNavigationConfig } from './member-team-account-navigation.config';
import pathsConfig from './paths.config';
import { personalAccountNavigationConfig } from './personal-account-navigation.config';

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
  return embed.icon ? (
    <DynamicIcon name={embed.icon} className="w-4" />
  ) : (
    <Box className="w-4" />
  );
}

/**
 * Creates a navigation item for an embed
 */
export function createEmbedNavigationItem(embed: Embed) {
  return {
    label: embed.title ?? 'Embed',
    path: embed.type === 'url' ? embed.value : `/embeds/${embed.id}`,
    Icon: createEmbedIcon(embed),
  };
}

/**
 * Adds client embeds to the navigation config
 */
export function addClientEmbedsToNavigation(
  baseConfig: NavigationConfig,
  embeds: Embed[],
): NavigationConfig {
  if (!embeds.length) return baseConfig;

  const routes = [...baseConfig.routes];

  // Add a divider before the section
  routes.push({ divider: true });

  // Add all embeds in a single section
  routes.push({
    section: true,
    label: 'Workspace',
    items: embeds.map(createEmbedNavigationItem),
  });

  return NavigationConfigSchema.parse({
    ...baseConfig,
    routes,
  });
}

/**
 * Adds agency embeds to the navigation config
 */
export function addAgencyEmbedsToNavigation(
  baseConfig: NavigationConfig,
  embeds: Embed[],
  AvatarComponent: React.ComponentType<AvatarProps>,
): NavigationConfig {
  if (!embeds.length) return baseConfig;

  const routes = [...baseConfig.routes];

  // Separate public and private embeds
  const publicEmbeds = embeds.filter((embed) => embed.visibility === 'public');
  const privateEmbeds = embeds.filter((embed) => embed.visibility !== 'public');

  // Only add sections if we have embeds to show
  if (privateEmbeds.length > 0 || publicEmbeds.length > 0) {
    // Add a divider before the sections
    routes.push({ divider: true });

    // Process private embeds by client
    if (privateEmbeds.length > 0) {
      // Group embeds by client
      const clientEmbedsMap = new Map<
        string,
        { client: Organization; embeds: Embed[] }
      >();

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

      // Add clients section if we have any client embeds
      if (clientEmbedsMap.size > 0) {
        routes.push({
          section: true,
          label: 'Clients',
          items: [], // Empty items array, we'll add client groups separately
        });

        // Add client groups
        Array.from(clientEmbedsMap.values()).forEach(({ client, embeds }) => {
          routes.push({
            label: client.name,
            Icon: (
              <AvatarComponent
                src={client.picture_url ?? ''}
                alt={client.name}
                username={client.name}
                className="h-5 w-5"
              />
            ),
            collapsible: true,
            collapsed: false,
            children: embeds.map(createEmbedNavigationItem),
          });
        });
      }
    }

    // Add public workspace section
    if (publicEmbeds.length > 0) {
      routes.push({
        label: 'Public Workspace',
        Icon: (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-white">
            <Link className="h-3 w-3" />
          </div>
        ),
        collapsible: true,
        collapsed: false,
        children: publicEmbeds.map(createEmbedNavigationItem),
      });
    }
  }

  return NavigationConfigSchema.parse({
    ...baseConfig,
    routes,
  });
}

/**
 * Builds the complete navigation config with embeds
 */
export function buildNavigationConfig(
  userRole: string | null | undefined,
  embeds: Embed[] | undefined,
  AvatarComponent: React.ComponentType<AvatarProps>,
): NavigationConfig {
  // Get base config
  const baseConfig = getBaseNavigationConfig(userRole);

  // If no embeds, return base config
  if (!embeds?.length) return baseConfig;

  // Filter embeds that should appear in the sidebar
  const sidebarEmbeds = embeds.filter(
    (embed) => embed.location === 'sidebar' && !embed.deleted_on,
  );

  if (!sidebarEmbeds.length) return baseConfig;

  // Add embeds based on user role
  const isClientRole = userRole?.startsWith('client_');

  if (isClientRole) {
    return addClientEmbedsToNavigation(baseConfig, sidebarEmbeds);
  } else {
    return addAgencyEmbedsToNavigation(
      baseConfig,
      sidebarEmbeds,
      AvatarComponent,
    );
  }
}
