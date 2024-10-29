import { use } from 'react';

import { cookies } from 'next/headers';

import { UserWorkspaceContextProvider } from '@kit/accounts/components';
import { If } from '@kit/ui/if';
import {
  Page,
  PageLayoutStyle,
  PageMobileNavigation,
  PageNavigation,
} from '@kit/ui/page';

import { AppLogo } from '~/components/app-logo';
import { personalAccountNavigationConfig } from '~/config/personal-account-navigation.config';
import { HomeMenuNavigation } from '~/home/(user)/_components/home-menu-navigation';
import { HomeMobileNavigation } from '~/home/(user)/_components/home-mobile-navigation';
import { HomeSidebar } from '~/home/(user)/_components/home-sidebar';
import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';
import { withI18n } from '~/lib/i18n/with-i18n';

import { BriefsProvider } from './contexts/briefs-context';
import Panel from './components/panel';

function BriefsLayout({ children }: React.PropsWithChildren) {
  const workspace = use(loadUserWorkspace());
  const style = getLayoutStyle();

  return (
    <Page style={style} contentContainerClassName='mx-auto flex h-screen w-full flex-col overflow-y-hidden px-4 lg:px-0'>
      <PageNavigation>
        <If condition={style === 'header'}>
          <HomeMenuNavigation workspace={workspace} />
        </If>

        <If condition={style === 'sidebar'}>
          <HomeSidebar workspace={workspace} />
        </If>
      </PageNavigation>

      <PageMobileNavigation className={'flex items-center justify-between'}>
        <AppLogo />
        <HomeMobileNavigation workspace={workspace} />
      </PageMobileNavigation>

      <UserWorkspaceContextProvider value={workspace}>
        <BriefsProvider>
          <div className="flex gap-8 max-h-full h-full">
            {children}

            <Panel />
          </div>
        </BriefsProvider>
      </UserWorkspaceContextProvider>
    </Page>
  );
}

export default withI18n(BriefsLayout);

function getLayoutStyle() {
  return (
    (cookies().get('layout-style')?.value as PageLayoutStyle) ??
    personalAccountNavigationConfig.style
  );
}