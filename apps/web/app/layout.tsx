import { Inter } from 'next/font/google';
import { type UnsafeUnwrappedCookies, cookies, headers } from 'next/headers';

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
import { cn } from '@kit/ui/utils';

import { AppLogo } from '~/components/app-logo';
import { RootProviders } from '~/components/root-providers';
import { personalAccountNavigationConfig } from '~/config/personal-account-navigation.config';
import { heading, sans } from '~/lib/fonts';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { generateRootMetadata } from '~/lib/root-metdata';

import '../styles/globals.css';
// import TimerPortal from './components/timer-portal';
import { HomeMenuNavigation } from './home/(user)/_components/home-menu-navigation';
import { HomeMobileNavigation } from './home/(user)/_components/home-mobile-navigation';
import { HomeSidebar } from './home/(user)/_components/home-sidebar';
import { loadUserWorkspace } from './home/(user)/_lib/server/load-user-workspace';

// import { TimeTrackerProvider } from './orders/[id]/context/time-tracker-context';

const inter = Inter({ subsets: ['latin'] }); // Cambiado a 'Inter'
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Access the custom `x-current-path` header
  const currentPath = headers().get('x-current-path') ?? '/';
  // Use a pattern to match authentication-related or excluded pages
  const excludedPatterns = [
    /^\/auth\//,
    /^\/set-password$/,
    /^\/join$/,
    /^\/update-password$/,
    /^\/checkout$/,
    /^\/buy-success$/,
  ];

  const isExcludedPage = excludedPatterns.some((pattern) =>
    pattern.test(currentPath),
  );

  const { language } = await createI18nServerInstance();
  const theme = getTheme();
  const style = getLayoutStyle();
  const className = getClassName(theme);

  let workspace = null;

  if (!isExcludedPage) {
    console.log('Loading workspace data...');
    workspace = await loadUserWorkspace();
  }

  const organizationSettings = await getOrganizationSettings().catch(() => {
    console.error(`Error on layout, failed to load organization settings`);
    return [];
  });

  return (
    <html lang={language} className={`${className} ${inter.className}`}>
      <body id="body-root">
        {isExcludedPage ? (
          <>
            <RootProviders
              theme={theme}
              lang={language}
              organizationSettings={organizationSettings}
              workspace={workspace}
            >
              {children}
            </RootProviders>
          </>
        ) : (
          <RootProviders
            theme={theme}
            lang={language}
            organizationSettings={organizationSettings}
            workspace={workspace}
          >
            <Page style={'sidebar'}>
              <PageNavigation>
                <If condition={style === 'header'}>
                  <HomeMenuNavigation workspace={workspace} />
                </If>

                <If condition={style === 'sidebar'}>
                  <HomeSidebar workspace={workspace} />
                </If>
              </PageNavigation>

              <PageMobileNavigation
                className={'flex items-center justify-between'}
              >
                <AppLogo />
                <HomeMobileNavigation workspace={workspace} />
              </PageMobileNavigation>

              {children}
            </Page>
          </RootProviders>
        )}

        <Toaster richColors={false} />
      </body>
    </html>
  );
}

function getClassName(theme?: string) {
  const dark = theme === 'dark';
  const light = !dark;

  const font = [sans.variable, heading.variable].reduce<string[]>(
    (acc, curr) => {
      if (acc.includes(curr)) return acc;

      return [...acc, curr];
    },
    [],
  );

  return cn('min-h-screen bg-background antialiased', ...font, {
    dark,
    light,
  });
}

function getLayoutStyle() {
  return (
    ((cookies() as unknown as UnsafeUnwrappedCookies).get('layout-style')
      ?.value as PageLayoutStyle) ?? personalAccountNavigationConfig.style
  );
}
function getTheme() {
  return (cookies() as unknown as UnsafeUnwrappedCookies).get('theme')?.value;
}

export const generateMetadata = generateRootMetadata;
