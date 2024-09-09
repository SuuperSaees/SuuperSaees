import { ThemedSidebar } from 'node_modules/@kit/accounts/src/components/ui/sidebar-themed-with-settings';
import { getUserRole } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';

import { SidebarContent, SidebarNavigation } from '@kit/ui/sidebar';

import { AppLogo } from '~/components/app-logo';
import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';
import { clientAccountNavigationConfig } from '~/config/client-account-navigation.config';
import { personalAccountNavigationConfig } from '~/config/personal-account-navigation.config';

// home imports
import type { UserWorkspace } from '../_lib/server/load-user-workspace';
import './styles/home-sidebar.css';


export async function HomeSidebar(props: { workspace: UserWorkspace }) {
  const { workspace, user } = props.workspace;
  const userRole = await getUserRole().catch(() => null);
  return (
    <ThemedSidebar>
      <div className="padding-24">
        <AppLogo />
      </div>

      <SidebarContent className={`mt-5 h-[calc(100%-160px)] overflow-y-auto`}>
        <SidebarNavigation
          config={
            userRole === 'client_owner' || userRole === 'client_member'
              ? clientAccountNavigationConfig
              : personalAccountNavigationConfig
          }
        />
        <SidebarContent></SidebarContent>
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