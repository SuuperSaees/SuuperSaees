import { cookies, type UnsafeUnwrappedCookies } from 'next/headers';

import { UserWorkspaceContextProvider } from '@kit/accounts/components';
import { If } from '@kit/ui/if';
import {
  Page,
  PageLayoutStyle,
  PageMobileNavigation,
  PageNavigation,
} from '@kit/ui/page';

import { AppLogo } from '~/components/app-logo';
import { RootProviders } from '~/components/root-providers';
import { personalAccountNavigationConfig } from '~/config/personal-account-navigation.config';
import { HomeMenuNavigation } from '~/home/(user)/_components/home-menu-navigation';
import { HomeMobileNavigation } from '~/home/(user)/_components/home-mobile-navigation';
import { HomeSidebar } from '~/home/(user)/_components/home-sidebar';
import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { getOrganizationSettings } from '~/team-accounts/src/server/actions/organizations/get/get-organizations';

import Panel from './components/panel';
import { BriefsProvider } from './contexts/briefs-context';

async function BriefsLayout({ children }: React.PropsWithChildren) {
  const workspace = await loadUserWorkspace();
  const style = getLayoutStyle();
  const organizationSettings = await loadOrganizationSettings();
  const { language } = await createI18nServerInstance();
  const theme = getTheme();

  return (
    <RootProviders
      theme={theme}
      lang={language}
      organizationSettings={organizationSettings}
    >
      <Page
        style={style}
        contentContainerClassName="mx-auto flex h-screen w-full flex-col overflow-y-hidden px-4 lg:px-0"
      >
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
            <div className="flex h-full max-h-full gap-8">
              {children}

              <Panel />
            </div>
          </BriefsProvider>
        </UserWorkspaceContextProvider>
      </Page>
    </RootProviders>
  );
}

export default withI18n(BriefsLayout);

function getLayoutStyle() {
  return (((cookies() as unknown as UnsafeUnwrappedCookies).get('layout-style')?.value as PageLayoutStyle) ?? personalAccountNavigationConfig.style);
}

async function loadOrganizationSettings() {
  try {
    return await getOrganizationSettings();
  } catch (error) {
    console.error('Error cargando los organizationSettings', error);
    return [];
  }
}

function getTheme() {
  return (cookies() as unknown as UnsafeUnwrappedCookies).get('theme')?.value;
}
