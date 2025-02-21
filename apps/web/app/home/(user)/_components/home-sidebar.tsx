import { ThemedSidebar } from 'node_modules/@kit/accounts/src/components/ui/sidebar-themed-with-settings';
import { z } from 'zod';
import { NavigationConfigSchema } from '@kit/ui/navigation-schema';
import { SidebarContent, SidebarNavigation } from '@kit/ui/sidebar';
import { AppLogo } from '~/components/app-logo';
import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';
import { clientAccountNavigationConfig, clientAccountGuestNavigationConfig } from '~/config/client-account-navigation.config';
import pathsConfig from '~/config/paths.config';
import { personalAccountNavigationConfig } from '~/config/personal-account-navigation.config';
import { teamMemberAccountNavigationConfig } from '../../../../config/member-team-account-navigation.config';
import { GuestContent } from './guest-content';
import { getOrganizationSettingsByOrganizationId } from '~/team-accounts/src/server/actions/organizations/get/get-organizations';
import type { UserWorkspace } from '../_lib/server/load-user-workspace';
import './styles/home-sidebar.css';
import { OrganizationSettings } from '~/lib/organization-settings.types';

type NavigationConfig = z.infer<typeof NavigationConfigSchema>;
export async function HomeSidebar(props: { workspace: UserWorkspace }) {
  const { workspace, user, organization, agency } = props.workspace;
  const userRole = workspace.role;

  const organizationSettings = await getOrganizationSettingsByOrganizationId(agency ? agency.id : organization?.id ?? '', true, ['dashboard_url']).catch((err) => {
    console.error(`Error client, getting organization settings: ${err}`)
    return []
  });

  const dashboardUrl = organizationSettings?.find(
    setting => setting.key === OrganizationSettings.KEYS.dashboard_url
  )?.value;

  let showDashboardUrl = !!dashboardUrl;

  // Verificar permisos adicionales para roles de cliente
  if (showDashboardUrl) {
    const clientRoles = new Set(['client_owner', 'client_member']);
    const urlHasUserIds = dashboardUrl?.includes('userIds=');
    
    if (urlHasUserIds && clientRoles.has(userRole ?? '')) {
      const userIds = new URL(dashboardUrl ?? '').searchParams.get('userIds')?.split(',') ?? [];
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
    agency_member: () => filterNavigationConfig(teamMemberAccountNavigationConfig),
    client_owner: () => clientAccountNavigationConfig,
    client_member: () => clientAccountNavigationConfig,
    client_guest: () => clientAccountGuestNavigationConfig,
    agency_owner: () => personalAccountNavigationConfig,
  } as const;

  const selectedNavigationConfig = navigationConfigMap[userRole as keyof typeof navigationConfigMap]?.() 
  ?? personalAccountNavigationConfig;

  return (
    <ThemedSidebar className='text-sm'>
      <div className="padding-24">
        <AppLogo />
      </div>

      <SidebarContent className={`mt-5 h-[calc(100%-160px)] b-["#f2f2f2"] overflow-y-auto`}>
        <SidebarNavigation config={selectedNavigationConfig} showDashboardUrl={showDashboardUrl} />
        {userRole === 'client_guest' && (
          <SidebarContent>
            <GuestContent />
          </SidebarContent>
        )}
      </SidebarContent>

      <div className={'absolute bottom-4 left-0 w-full'}>
        {
          userRole !== 'client_guest' && (
            <SidebarContent>
            <ProfileAccountDropdownContainer
              collapsed={false}
              user={user}
              account={workspace}
            />
          </SidebarContent>
          )
        }
      </div>
    </ThemedSidebar>
  );
}