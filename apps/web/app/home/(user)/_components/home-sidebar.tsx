import { ThemedSidebar } from 'node_modules/@kit/accounts/src/components/ui/sidebar-themed-with-settings';
import { getUserRole } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';
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
// home imports
import type { UserWorkspace } from '../_lib/server/load-user-workspace';
import './styles/home-sidebar.css';

type NavigationConfig = z.infer<typeof NavigationConfigSchema>;
export async function HomeSidebar(props: { workspace: UserWorkspace }) {
  const { workspace, user } = props.workspace;
  const userRole = await getUserRole().catch((err) => {
    console.error(`Error client, getting user role: ${err}`)
    return ''
  });
  // const { t } = useTranslation('auth');

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
        <SidebarNavigation config={selectedNavigationConfig} />
        {userRole === 'client_guest' && (
          <SidebarContent>
            <GuestContent />
          </SidebarContent>
        )}
      </SidebarContent>

      <div className={'absolute bottom-4 left-0 w-full'}>
        <SidebarContent>
          <ProfileAccountDropdownContainer
            collapsed={false}
            user={user}
            account={workspace}
          />
        </SidebarContent>
      </div>
    </ThemedSidebar>
  );
}