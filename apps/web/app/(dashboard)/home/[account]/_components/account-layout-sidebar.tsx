'use client';

import { useRouter } from 'next/navigation';

import { User } from '@supabase/supabase-js';

import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';

import { AccountSelector } from '@kit/accounts/account-selector';
import { If } from '@kit/ui/if';
import { Sidebar, SidebarContent } from '@kit/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@kit/ui/tooltip';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import { ProfileAccountDropdownContainer } from '~/(dashboard)/home/_components/personal-account-dropdown-container';
import featureFlagsConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

import { AccountLayoutSidebarNavigation } from './account-layout-sidebar-navigation';

type AccountModel = {
  label: string | null;
  value: string | null;
  image: string | null;
};

const features = {
  enableTeamAccounts: featureFlagsConfig.enableTeamAccounts,
  enableTeamCreation: featureFlagsConfig.enableTeamCreation,
};

export function AccountLayoutSidebar(props: {
  account: string;
  accounts: AccountModel[];
  collapsed: boolean;
  user: User | null;
}) {
  return (
    <Sidebar collapsed={props.collapsed}>
      {({ collapsed, setCollapsed }) => (
        <SidebarContainer
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          account={props.account}
          accounts={props.accounts}
          user={props.user}
        />
      )}
    </Sidebar>
  );
}

function SidebarContainer(props: {
  account: string;
  accounts: AccountModel[];
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  collapsible?: boolean;
  user: User | null;
}) {
  const { account, accounts } = props;
  const router = useRouter();

  return (
    <>
      <SidebarContent className={'h-16 justify-center'}>
        <AccountSelector
          selectedAccount={account}
          accounts={accounts}
          collapsed={props.collapsed}
          features={features}
          onAccountChange={(value) => {
            const path = value
              ? pathsConfig.app.accountHome.replace('[account]', value)
              : pathsConfig.app.home;

            router.replace(path);
          }}
        />
      </SidebarContent>

      <SidebarContent className={`h-[calc(100%-160px)] overflow-y-auto mt-5`}>
        <AccountLayoutSidebarNavigation account={account} />
      </SidebarContent>

      <div className={'absolute bottom-4 left-0 w-full'}>
        <SidebarContent>
          <ProfileAccountDropdownContainer
            user={props.user}
            collapsed={props.collapsed}
          />

          <If condition={props.collapsible}>
            <AppSidebarFooterMenu
              collapsed={props.collapsed}
              setCollapsed={props.setCollapsed}
            />
          </If>
        </SidebarContent>
      </div>
    </>
  );
}

function AppSidebarFooterMenu(props: {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}) {
  return (
    <CollapsibleButton
      collapsed={props.collapsed}
      onClick={props.setCollapsed}
    />
  );
}

function CollapsibleButton({
  collapsed,
  onClick,
}: React.PropsWithChildren<{
  collapsed: boolean;
  onClick: (collapsed: boolean) => void;
}>) {
  const className = cn(
    `bg-background absolute -right-[10.5px] bottom-4 cursor-pointer block`,
  );

  const iconClassName = 'bg-background text-muted-foreground h-5 w-5';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          className={className}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => onClick(!collapsed)}
        >
          <ArrowRightCircle
            className={cn(iconClassName, {
              hidden: !collapsed,
            })}
          />

          <ArrowLeftCircle
            className={cn(iconClassName, {
              hidden: collapsed,
            })}
          />
        </TooltipTrigger>

        <TooltipContent sideOffset={20}>
          <Trans
            i18nKey={
              collapsed ? 'common:expandSidebar' : 'common:collapseSidebar'
            }
          />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
