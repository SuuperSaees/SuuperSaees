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
import { withI18n } from '~/lib/i18n/with-i18n';
import { HomeMenuNavigation } from '~/home/(user)/_components/home-menu-navigation';
import { HomeMobileNavigation } from '~/home/(user)/_components/home-mobile-navigation';
import { HomeSidebar } from '~/home/(user)/_components/home-sidebar';
import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';


import { getOrganizationSettings } from 'node_modules/@kit/team-accounts/src/server/actions/organizations/get/get-organizations';
import { RootProviders } from '~/components/root-providers';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

async function CalendarLayout({ children }: React.PropsWithChildren) {
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
      <Page style={style}>
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
          {children}
        </UserWorkspaceContextProvider>
      </Page>
    </RootProviders>
  );
}

export default withI18n(CalendarLayout);

function getLayoutStyle() {
  const cookieValue = (cookies() as { get(name: string): { value: string } | undefined }).get('layout-style')?.value as PageLayoutStyle;
  return cookieValue ?? personalAccountNavigationConfig.style;
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
  const cookieValue = (cookies() as { get(name: string): { value: string } | undefined }).get('theme')?.value;
  return cookieValue ?? 'light';
}