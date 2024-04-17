import { Urbanist as HeadingFont, Inter as SansFont } from 'next/font/google';
import Head from 'next/head';
import { cookies, headers } from 'next/headers';

import { Toaster } from '@kit/ui/sonner';
import { cn } from '@kit/ui/utils';

import { RootProviders } from '~/components/root-providers';
import appConfig from '~/config/app.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

import '../styles/globals.css';

const sans = SansFont({
  subsets: ['latin'],
  variable: '--font-sans',
  fallback: ['system-ui', 'Helvetica Neue', 'Helvetica', 'Arial'],
  preload: true,
  weight: ['300', '400', '500', '600', '700'],
});

const heading = HeadingFont({
  subsets: ['latin'],
  variable: '--font-heading',
  fallback: ['system-ui', 'Helvetica Neue', 'Helvetica', 'Arial'],
  preload: true,
  weight: ['500', '700'],
});

export const runtime = 'edge';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = await createI18nServerInstance();
  const theme = getTheme();

  return (
    <html lang={language} className={getClassName(theme)}>
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

export const metadata = {
  title: appConfig.name,
  description: appConfig.description,
  metadataBase: new URL(appConfig.url),
  openGraph: {
    url: appConfig.url,
    siteName: appConfig.name,
    description: appConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: appConfig.title,
    description: appConfig.description,
  },
  icons: {
    icon: '/images/favicon/favicon.ico',
    shortcut: '/shortcut-icon.png',
    apple: '/images/favicon/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon-precomposed.png',
    },
  },
};

function CsrfTokenMeta() {
  const csrf = headers().get('x-csrf-token') ?? '';

  return <meta content={csrf} name="csrf-token" />;
}
