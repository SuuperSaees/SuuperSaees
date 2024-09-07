import { Epilogue } from 'next/font/google';
import { cookies } from 'next/headers';



import { getOrganizationSettings } from 'node_modules/@kit/team-accounts/src/server/actions/organizations/get/get-organizations';



import { Toaster } from '@kit/ui/sonner';
import { cn } from '@kit/ui/utils';



import { RootProviders } from '~/components/root-providers';
import { heading, sans } from '~/lib/fonts';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { generateRootMetadata } from '~/lib/root-metdata';

import '../styles/globals.css';

const epilogue = Epilogue({ subsets: ['latin'] });
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = await createI18nServerInstance();
  const theme = getTheme();
  const className = getClassName(theme);
  const organizationSettings = await getOrganizationSettings();

  return (
    <html lang={language} className={`${className} ${epilogue.className}`}>
      <body>
        <RootProviders
          theme={theme}
          lang={language}
          organizationSettings={organizationSettings}
        >
          {children}
        </RootProviders>

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

function getTheme() {
  return cookies().get('theme')?.value;
}

export const generateMetadata = generateRootMetadata;