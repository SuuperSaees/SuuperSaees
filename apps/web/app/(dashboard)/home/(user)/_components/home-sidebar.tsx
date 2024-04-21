import { use } from 'react';

import { cookies } from 'next/headers';

import { If } from '@kit/ui/if';
import { Sidebar, SidebarContent, SidebarNavigation } from '@kit/ui/sidebar';

import { loadUserWorkspace } from '~/(dashboard)/home/(user)/_lib/server/load-user-workspace';
import { AppLogo } from '~/components/app-logo';
import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';
import featuresFlagConfig from '~/config/feature-flags.config';
import { personalAccountSidebarConfig } from '~/config/personal-account-sidebar.config';

// home imports
import { HomeSidebarAccountSelector } from '../_components/home-sidebar-account-selector';

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

      <SidebarContent className={`mt-5 h-[calc(100%-160px)] overflow-y-auto`}>
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
