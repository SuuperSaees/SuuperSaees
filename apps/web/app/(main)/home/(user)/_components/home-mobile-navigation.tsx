'use client';

import Link from 'next/link';

import { LogOut, Menu } from 'lucide-react';

import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Trans } from '@kit/ui/trans';

import { personalAccountNavigationConfig } from '~/config/personal-account-navigation.config';
import { useOrganizationSettings } from '../../../../../../../packages/features/accounts/src/context/organization-settings-context';
import pathsConfig from '~/config/paths.config';
import { shouldShowDashboardUrl } from '~/config/navigation-utils';

// home imports
import type { UserWorkspace } from '../_lib/server/load-user-workspace';

export function HomeMobileNavigation(props: { workspace: UserWorkspace }) {
  const { workspace } = props;
  const signOut = useSignOut();
  const userId = workspace.id;
  const userRole = workspace.role;
  const organizationSettings = useOrganizationSettings();

  const catalogProductUrl = Boolean(organizationSettings.catalog_product_url);

  const toolCopyListUrl = Boolean(organizationSettings.tool_copy_list_url);
  const partenersUrl = Boolean(organizationSettings.parteners_url);
  // const wholesaleUrl = Boolean(organizationSettings.catalog_product_wholesale_url);
  // const privateLabelUrl = Boolean(organizationSettings.catalog_product_private_label_url);
  const trainingUrl = Boolean(organizationSettings.training_url);
  const catalogSourcingChinaUrl = Boolean(organizationSettings.catalog_sourcing_china_url);
  const calendarUrl = Boolean(organizationSettings.calendar_url);
  const catalogProviderUrl = Boolean(organizationSettings.catalog_provider_url);

  const showDashboardUrl = shouldShowDashboardUrl(
    organizationSettings.dashboard_url, 
    userRole, 
    userId
  );

  const Links = personalAccountNavigationConfig.routes.map((item, index) => {
    if (!showDashboardUrl && item.path === pathsConfig.app.dashboard) {
      return null;
    }

    if (item.label === 'common:aiToolsName' && !toolCopyListUrl) {
      return null;
    } else if (item.label === 'common:partnersName' && !partenersUrl) {
      return null;
    } else if(item.label === 'common:trainingName' && !trainingUrl){
      return null;
    } else if (item.label === 'common:calendarName' && !calendarUrl) {
      return null;
    }

    if ('children' in item) {
      return item.children.map((child) => {
        if (
          (child.label === 'common:catalogProviderName' &&
            !catalogProviderUrl) ||
          (child.label === 'common:catalogProductName' &&
            !catalogProductUrl) ||
          (child.label === 'common:toolCopyListName' &&
            !toolCopyListUrl) ||
          (child.label === 'common:partnersName' &&
            !partenersUrl) ||
          (child.label === 'common:catalogWholesaleName' &&
            !catalogProductWholesaleUrl) ||
          (child.label === 'common:catalogPrivateLabelName' &&
            !catalogProductPrivateLabelUrl) ||
          (child.label === 'common:catalogSourcingChinaName' &&
            !catalogSourcingChinaUrl)
        ) {
          return null;
        }
        return (
          <DropdownLink
            key={child.path}
            Icon={child.Icon}
            path={child.path}
            label={child.label}
          />
        );
      });
    }

    if ('divider' in item) {
      return <DropdownMenuSeparator key={index} />;
    }

    

    return (
      <DropdownLink
        key={item.path}
        Icon={item.Icon}
        path={item.path}
        label={item.label}
      />
    );
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Menu className={'h-9'} />
        </DropdownMenuTrigger>

        <DropdownMenuContent sideOffset={10} className={'w-screen rounded-none'}>
    

          <DropdownMenuGroup>{Links}</DropdownMenuGroup>

          <DropdownMenuSeparator />

          <SignOutDropdownItem onSignOut={() => signOut.mutateAsync()} />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
 
  );
}

function DropdownLink(
  props: React.PropsWithChildren<{
    path: string;
    label: string;
    Icon: React.ReactNode;
  }>,
) {
  return (
    <DropdownMenuItem asChild key={props.path}>
      <Link
        href={props.path}
        className={'flex h-12 w-full items-center space-x-4'}
      >
        {props.Icon}

        <span>
          <Trans i18nKey={props.label} defaults={props.label} />
        </span>
      </Link>
    </DropdownMenuItem>
  );
}

function SignOutDropdownItem(
  props: React.PropsWithChildren<{
    onSignOut: () => unknown;
  }>,
) {
  return (
    <DropdownMenuItem
      className={'flex h-12 w-full items-center space-x-4'}
      onClick={props.onSignOut}
    >
      <LogOut className={'h-6'} />

      <span>
        <Trans i18nKey={'common:signOut'} defaults={'Sign out'} />
      </span>
    </DropdownMenuItem>
  );
}
