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
  
  // Get the favicon URL from cookies
  // const cookies = headers().get('cookie') ?? '';
  const defaultFaviconUrl = `${process.env.NEXT_PUBLIC_FAVICON_URL_BASE}/${host}_favicon_url`;
  
  // Try to find the favicon_url from authDetails cookie
  const faviconUrl = defaultFaviconUrl;
  // const authDetailsRegex = new RegExp(`authDetails_${host}=({.*?})`);
  // const authDetailsMatch = cookies.match(authDetailsRegex);
  
  // if (authDetailsMatch) {
  //   try {
  //     const authDetails = JSON.parse(decodeURIComponent(authDetailsMatch?.[1] ?? ''));
  //     faviconUrl = authDetails.favicon_url || defaultFaviconUrl;
  //   } catch (e) {
  //     console.error("Error parsing authDetails from cookies", e);
  //     faviconUrl = defaultFaviconUrl;
  //   }
  // }

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