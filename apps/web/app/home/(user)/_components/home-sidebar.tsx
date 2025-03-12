'use client';

import { Box } from 'lucide-react';
import { ThemedSidebar } from 'node_modules/@kit/accounts/src/components/ui/sidebar-themed-with-settings';
import { z } from 'zod';

import { NavigationConfigSchema } from '@kit/ui/navigation-schema';
import { SidebarContent } from '@kit/ui/sidebar';
import { AppLogo } from '~/components/app-logo';
import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';
import {
  clientAccountGuestNavigationConfig,
  clientAccountNavigationConfig,
} from '~/config/client-account-navigation.config';
import pathsConfig from '~/config/paths.config';
import { personalAccountNavigationConfig } from '~/config/personal-account-navigation.config';

import { useOrganizationSettings } from '../../../../../../packages/features/accounts/src/context/organization-settings-context';
import { teamMemberAccountNavigationConfig } from '../../../../config/member-team-account-navigation.config';
import { DynamicIcon } from '../../../components/shared/dynamic-icon';
import type { UserWorkspace } from '../_lib/server/load-user-workspace';
import { CustomSidebarNavigation } from './custom-sidebar-navigation';
import { GuestContent } from './guest-content';
import './styles/home-sidebar.css';

type NavigationConfig = z.infer<typeof NavigationConfigSchema>;

// Custom SidebarNavigation component that adds the MessageBadge to the "/messages" navigation item

export function HomeSidebar(props: { workspace: UserWorkspace }) {
  const { workspace, user, organization } = props.workspace;
  const userRole = workspace.role;

  const {
    dashboard_url: dashboardUrl,
    catalog_provider_url: catalogProviderUrl,
    catalog_product_url: catalogProductUrl,
    tool_copy_list_url: toolCopyListUrl,
  } = useOrganizationSettings();

  let showDashboardUrl = !!dashboardUrl;

  // Verify if the dashboard url has userIds
  if (showDashboardUrl) {
    const clientRoles = new Set(['client_owner', 'client_member']);
    const urlHasUserIds = dashboardUrl?.includes('userIds=');

    if (urlHasUserIds && clientRoles.has(userRole ?? '')) {
      const userIds =
        new URL(dashboardUrl ?? '').searchParams.get('userIds')?.split(',') ??
        [];
      showDashboardUrl = userIds.includes(workspace.id ?? '');
    }
  }

  // Filter the navigation config to remove the /clients path if userRole is 'agency_owner' or 'client_owner'
  const filterNavigationConfig = (config: NavigationConfig) => {
    if (userRole !== 'agency_owner') {
      return {
        ...config,
        routes: config.routes.map((item) => {
          // Check if the item has children
          if ('children' in item) {
            return {
              ...item,
              children: item.children.filter(
                (child) => child.path !== pathsConfig.app.clients,
              ),
            };
          }
          return item; // Return item unchanged if it doesn't have children
        }),
      };
    }
    return config;
  };
  const navigationConfigMap = {
    agency_member: () =>
      filterNavigationConfig(teamMemberAccountNavigationConfig),
    client_owner: () => clientAccountNavigationConfig,
    client_member: () => clientAccountNavigationConfig,
    client_guest: () => clientAccountGuestNavigationConfig,
    agency_owner: () => personalAccountNavigationConfig,
  } as const;

  const selectedNavigationConfig =
    navigationConfigMap[userRole as keyof typeof navigationConfigMap]?.() ??
    personalAccountNavigationConfig;

  // new tabs in the sidebar with embeds
  const embeds = organization?.embeds;
  const isClientRole = userRole?.startsWith('client_');

  const sidebarEmbeds =
    embeds?.filter((embed) => {
      // Basic filters that apply to all roles
      const basicFilters = embed.location === 'sidebar' && !embed.deleted_on;

      // For client roles, show all embeds regardless of visibility
      // For non-client roles (agency roles), only show public embeds
      return (
        basicFilters && (!isClientRole ? embed.visibility === 'public' : true)
      );
    }) ?? [];

  // Add embeds to the navigation config if there are sidebar embeds
  const navigationConfigWithEmbeds = sidebarEmbeds.length
    ? NavigationConfigSchema.parse({
        ...selectedNavigationConfig,
        routes: [
          ...selectedNavigationConfig.routes,
          // Add a divider before embeds if there are any
          ...(sidebarEmbeds.length > 0 ? [{ divider: true }] : []),
          // Add each embed as a separate tab
          ...sidebarEmbeds.map((embed) => ({
            label: embed.title ?? 'Embed',
            path: embed.type === 'url' ? embed.value : `/embeds/${embed.id}`,
            Icon: embed.icon ? (
              <DynamicIcon name={embed.icon} className="w-4" />
            ) : (
              <Box className="w-4" />
            ),
          })),
        ],
      })
    : selectedNavigationConfig;

  return (
    <ThemedSidebar className="text-sm">
      <div className="padding-24">
        <AppLogo />
      </div>

      <SidebarContent
        className={`b-["#f2f2f2"] mt-5 h-[calc(100%-160px)] overflow-y-auto`}
      >
        <CustomSidebarNavigation
          config={navigationConfigWithEmbeds}
          showDashboardUrl={showDashboardUrl}
          catalogProviderUrl={!!catalogProviderUrl}
          catalogProductUrl={!!catalogProductUrl}
          toolCopyListUrl={!!toolCopyListUrl}
          userId={user?.id ?? ''}
        />
        {userRole === 'client_guest' && (
          <SidebarContent>
            <GuestContent />
          </SidebarContent>
        )}
      </SidebarContent>

      <div className={'absolute bottom-4 left-0 w-full'}>
        {userRole !== 'client_guest' && (
          <SidebarContent>
            <ProfileAccountDropdownContainer
              collapsed={false}
              user={user}
              account={workspace}
            />
          </SidebarContent>
        )}
      </div>
    </ThemedSidebar>
  );
}
