import { use } from 'react';

import { cookies } from 'next/headers';

import { If } from '@kit/ui/if';
import { Sidebar, SidebarContent, SidebarNavigation } from '@kit/ui/sidebar';

import { AppLogo } from '~/components/app-logo';
import featuresFlagConfig from '~/config/feature-flags.config';
import { personalAccountSidebarConfig } from '~/config/personal-account-sidebar.config';

// home imports
import { HomeSidebarAccountSelector } from '../_components/home-sidebar-account-selector';
import { ProfileAccountDropdownContainer } from '../_components/personal-account-dropdown-container';
import { loadUserWorkspace } from '../_lib/load-user-workspace';

export function HomeSidebar() {
  const collapsed = getSidebarCollapsed();
  const { accounts, user, workspace } = use(loadUserWorkspace());

  return (
    <Sidebar collapsed={collapsed}>
      <SidebarContent className={'h-16 justify-center'}>
        <If
          condition={featuresFlagConfig.enableTeamAccounts}
          fallback={<AppLogo className={'py-2'} />}
        >
          <HomeSidebarAccountSelector
            collapsed={collapsed}
            accounts={accounts}
          />
        </If>
      </SidebarContent>

      <SidebarContent className={`h-[calc(100%-160px)] overflow-y-auto mt-5`}>
        <SidebarNavigation config={personalAccountSidebarConfig} />
      </SidebarContent>

      <div className={'absolute bottom-4 left-0 w-full'}>
        <SidebarContent>
          <ProfileAccountDropdownContainer
            collapsed={collapsed}
            user={user}
            account={workspace}
          />
        </SidebarContent>
      </div>
    </Sidebar>
  );
}

function getSidebarCollapsed() {
  return cookies().get('sidebar-collapsed')?.value === 'true';
}
