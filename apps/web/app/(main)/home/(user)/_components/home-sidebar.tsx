'use client';

import { ThemedSidebar } from 'node_modules/@kit/accounts/src/components/ui/sidebar-themed-with-settings';

import { SidebarContent } from '@kit/ui/sidebar';
import { AppLogo } from '~/components/app-logo';
import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';
import { useOrganizationSettings } from '../../../../../../../packages/features/accounts/src/context/organization-settings-context';
import Avatar from '../../../../components/ui/avatar';
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
import { useTranslation } from 'react-i18next';

/**
 * Home sidebar component that displays navigation based on user role and embeds
 */
export function HomeSidebar(props: { workspace: UserWorkspace }) {
  const { workspace, user, pinnedOrganizations, organization } = props.workspace;
  const userRole = workspace.role;
  const { t } = useTranslation();
  // Get organization settings
  const settings = useOrganizationSettings();
  
  // Access settings safely
  const dashboardUrl = settings.dashboard_url;

  // Determine if dashboard URL should be shown
  const showDashboardUrl = shouldShowDashboardUrl(
    dashboardUrl, 
    userRole, 
    workspace.id
  );

  // Build the navigation config with embeds and client organizations
  const navigationConfig = buildNavigationConfig(
    userRole,
    organization?.embeds as Embed[] | undefined,
    Avatar,
    t,
    pinnedOrganizations
  );

  // Get additional settings with type assertion for the UI
  const catalogProviderUrl = Boolean(settings.catalog_provider_url);
  const catalogProductUrl = Boolean(settings.catalog_product_url);

  const toolCopyListUrl = Boolean(settings.tool_copy_list_url);
  const partenersUrl = Boolean(settings.parteners_url);
  const wholesaleUrl = Boolean(settings.catalog_product_wholesale_url);
  const privateLabelUrl = Boolean(settings.catalog_product_private_label_url);
  const trainingUrl = Boolean(settings.training_url);
  const sourcingChinaUrl = Boolean(settings.catalog_sourcing_china_url);
  const calendarUrl = Boolean(settings.calendar_url);
  // const catalogProductUrl = wholesaleUrl || privateLabelUrl;

  return (
    <ThemedSidebar className="text-sm scrollbar-on-hover">
      <div className="pt-5 pb-3 px-6.5">
        <AppLogo />
      </div>

      <SidebarContent
        className={`b-["#fdfdfd"] h-[calc(100%-160px)] overflow-y-auto gap-0.5`}
      >
        <CustomSidebarNavigation
          config={navigationConfig}
          showDashboardUrl={showDashboardUrl}
          catalogProviderUrl={catalogProviderUrl}
          catalogProductUrl={catalogProductUrl}
          toolCopyListUrl={toolCopyListUrl}
          partenersUrl={partenersUrl}
          catalogProductWholesaleUrl={wholesaleUrl}
          catalogProductPrivateLabelUrl={privateLabelUrl}
          trainingUrl={trainingUrl}
          catalogSourcingChinaUrl={sourcingChinaUrl}
          calendarUrl={calendarUrl}
          userId={user?.id ?? ''}
          userRole={userRole ?? ''}
          userOrganizationId={organization?.id ?? ''}
        />
        {userRole === 'client_guest' && (
          <SidebarContent>
            <GuestContent />
          </SidebarContent>
        )}
      </SidebarContent>

      <div className={'w-full mb-4 mt-auto'}>
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
