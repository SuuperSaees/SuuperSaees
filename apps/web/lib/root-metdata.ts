import { Metadata } from 'next';

import { headers } from 'next/headers';

import appConfig from '~/config/app.config';

/**
 * @name generateRootMetadata
 * @description Generates the root metadata for the application
 */
export const generateRootMetadata = (): Metadata => {
  const csrfToken = headers().get('x-csrf-token') ?? '';
  const host = headers().get('host') ?? '';
  const faviconUrl = `${process.env.NEXT_PUBLIC_FAVICON_URL_BASE}/${host}_favicon_url`;
  return {
    title: appConfig.title,
    description: appConfig.description,
    metadataBase: new URL(appConfig.url),
    applicationName: appConfig.name,
    other: {
      'csrf-token': csrfToken,
    },
    openGraph: {
      url: appConfig.url,
      siteName: appConfig.name,
      title: appConfig.title,
      description: appConfig.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: appConfig.title,
      description: appConfig.description,
    },
    icons: {
      icon: faviconUrl,
      // apple: '/images/favicon/apple-touch-icon.png',
    },
  };
};