'use client';

import { ThemedSidebar } from 'node_modules/@kit/accounts/src/components/ui/sidebar-themed-with-settings';

import { SidebarContent } from '@kit/ui/sidebar';
import { AppLogo } from '~/components/app-logo';
import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';
import { useOrganizationSettings } from '../../../../../../packages/features/accounts/src/context/organization-settings-context';
import Avatar from '../../../components/ui/avatar';
import type { UserWorkspace } from '../_lib/server/load-user-workspace';
import { CustomSidebarNavigation } from './custom-sidebar-navigation';
import { GuestContent } from './guest-content';
import './styles/home-sidebar.css';

// Import utility functions from our new module
import { 
  buildNavigationConfig, 
  shouldShowDashboardUrl,
  type Embed
} from '~/config/navigation-utils';

/**
 * Home sidebar component that displays navigation based on user role and embeds
 */
export function HomeSidebar(props: { workspace: UserWorkspace }) {
  const { workspace, user, organization } = props.workspace;
  const userRole = workspace.role;

  // Get organization settings
  const {
    dashboard_url: dashboardUrl,
    catalog_provider_url: catalogProviderUrl,
    catalog_product_url: catalogProductUrl,
    tool_copy_list_url: toolCopyListUrl,
  } = useOrganizationSettings();

  // Determine if dashboard URL should be shown
  const showDashboardUrl = shouldShowDashboardUrl(
    dashboardUrl, 
    userRole, 
    workspace.id
  );

  // Build the navigation config with embeds
  const navigationConfig = buildNavigationConfig(
    userRole,
    organization?.embeds as Embed[] | undefined,
    Avatar
  );

  return (
    <ThemedSidebar className="text-sm">
      <div className="padding-24">
        <AppLogo />
      </div>

      <SidebarContent
        className={`b-["#f2f2f2"] mt-5 h-[calc(100%-160px)] overflow-y-auto`}
      >
        <CustomSidebarNavigation
          config={navigationConfig}
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
