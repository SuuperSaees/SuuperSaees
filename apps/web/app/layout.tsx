import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';

import { getOrganizationSettings } from 'node_modules/@kit/team-accounts/src/server/actions/organizations/get/get-organizations';

import { cn } from '@kit/ui/utils';

import '~/../styles/globals.css';
import { RootProviders } from '~/components/root-providers';
import { heading, sans } from '~/lib/fonts';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { generateRootMetadata } from '~/lib/root-metdata';

const inter = Inter({ subsets: ['latin'] }); // Changed to 'Inter'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = await createI18nServerInstance();
  const theme = getTheme();
  const className = getClassName(theme);
  const organizationSettings = await loadOrganizationSettings();
  // const className = getClassName(theme);
  return (
    <html lang={language} className={`${className} ${inter.className}`}>
      <body>
        <RootProviders
          theme={theme}
          lang={language}
          organizationSettings={organizationSettings}
        >
          {children}
        </RootProviders>
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

async function loadOrganizationSettings() {
  try {
    return await getOrganizationSettings();
  } catch (error) {
    console.error('Error loading organization settings', error);
    return [];
  }
}

function getTheme() {
  const cookieValue = (
    cookies() as { get(name: string): { value: string } | undefined }
  ).get('theme')?.value;
  return cookieValue ?? 'light';
}

export const generateMetadata = generateRootMetadata;
