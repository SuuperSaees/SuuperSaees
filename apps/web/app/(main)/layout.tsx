import { cookies, headers } from 'next/headers';

import { getOrganizationSettings } from 'node_modules/@kit/team-accounts/src/server/actions/organizations/get/get-organizations';

import { UserWorkspaceContextProvider } from '@kit/accounts/components';
import { If } from '@kit/ui/if';
import {
  Page,
  PageLayoutStyle,
  PageMobileNavigation,
  PageNavigation,
} from '@kit/ui/page';
import { Toaster } from '@kit/ui/sonner';

// import { cn } from '@kit/ui/utils';
import { AppLogo } from '~/components/app-logo';
import { RootProviders } from '~/components/root-providers';
import { personalAccountNavigationConfig } from '~/config/personal-account-navigation.config';
// import { heading, sans } from '~/lib/fonts';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { generateRootMetadata } from '~/lib/root-metdata';

import { HomeMenuNavigation } from './home/(user)/_components/home-menu-navigation';
import { HomeMobileNavigation } from './home/(user)/_components/home-mobile-navigation';
import { HomeSidebar } from './home/(user)/_components/home-sidebar';
import { loadUserWorkspace } from './home/(user)/_lib/server/load-user-workspace';
import { TimeTrackerProvider } from './orders/[id]/context/time-tracker-context';

// WARNING: Thse use of functions like headers and cookies that are dynamic functions could lead to cache inconsistencies,
// since using them can opt out the Full route cache and the route will be rendered on each request (dynamically rendered).
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  
  const pathname = headers().get('x-current-path') ?? '/';
  const exlusionPaths = ['/set-password', '/checkout', '/services/catalog'];
  const style = getLayoutStyle();
  const workspace = exlusionPaths.includes(pathname) ? null : await loadUserWorkspace();
  const theme = getTheme();
  const { language } = await createI18nServerInstance();
  const organizationSettings = await loadOrganizationSettings();

  if (exlusionPaths.includes(pathname)) {
    return (
      <RootProviders
        theme={theme}
        lang={language}
        organizationSettings={organizationSettings}
      >
        <div className="h-screen w-screen">{children}</div>
      </RootProviders>
    );
  }

  return (
    <>
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
            <TimeTrackerProvider>{children}</TimeTrackerProvider>
          </UserWorkspaceContextProvider>
        </Page>

        <Toaster richColors={false} />
      </RootProviders>
    </>
  );
}

// function getClassName(theme?: string) {
//   const dark = theme === 'dark';
//   const light = !dark;

//   const font = [sans.variable, heading.variable].reduce<string[]>(
//     (acc, curr) => {
//       if (acc.includes(curr)) return acc;

//       return [...acc, curr];
//     },
//     [],
//   );

//   return cn('min-h-screen bg-background antialiased', ...font, {
//     dark,
//     light,
//   });
// }

function getTheme() {
  const cookieValue = (
    cookies() as { get(name: string): { value: string } | undefined }
  ).get('theme')?.value;
  return cookieValue ?? 'light';
}

function getLayoutStyle() {
  const cookieValue = (
    cookies() as { get(name: string): { value: string } | undefined }
  ).get('layout-style')?.value as PageLayoutStyle;
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

export const generateMetadata = generateRootMetadata;
