import Head from 'next/head';
import { cookies } from 'next/headers';

import { Toaster } from '@kit/ui/sonner';
import { cn } from '@kit/ui/utils';

import { CsrfTokenMeta } from '~/components/csrf-token-meta';
import { RootProviders } from '~/components/root-providers';
import { heading, sans } from '~/lib/fonts';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { rootMetadata } from '~/lib/root-metdata';

import '../styles/globals.css';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = await createI18nServerInstance();
  const theme = getTheme();
  const className = getClassName(theme);

  return (
    <html lang={language} className={className}>
      <Head>
        <CsrfTokenMeta />
      </Head>

      <body>
        <RootProviders theme={theme} lang={language}>
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

  return cn(
    'min-h-screen bg-background antialiased',
    sans.variable,
    heading.variable,
    {
      dark,
      light,
    },
  );
}

function getTheme() {
  return cookies().get('theme')?.value;
}

export const metadata = rootMetadata;
