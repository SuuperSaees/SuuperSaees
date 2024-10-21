import { Metadata } from 'next';



import { headers } from 'next/headers';



import appConfig from '~/config/app.config';
import { getFullDomainBySubdomain } from '~/multitenancy/utils/get/get-domain';

/**
 * @name generateRootMetadata
 * @description Generates the root metadata for the application
 */
export const generateRootMetadata = (): Promise<Metadata> => {
  const csrfToken = headers().get('x-csrf-token') ?? '';
  const host = headers().get('host') ?? '';
  const FAVICON_KEY = 'favicon_url';
  const values = [FAVICON_KEY];

  return getFullDomainBySubdomain(host, true, values)
    .then((domainFullData) => {
      const faviconUrl =
        domainFullData?.settings.find((setting) => setting.key === FAVICON_KEY)
          ?.value ?? ''; // Default to empty string if not found, you can use /images/favicon/favicon.ico as default

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
          icon: [{ url: faviconUrl }],
          apple: [{ url: faviconUrl }],
          other: [{ url: faviconUrl }],
          shortcut: [{ url: faviconUrl }],
          // icon: faviconUrl,
          // apple: faviconUrl,
          // apple: '/images/favicon/apple-touch-icon.png',
        },
      };
    })
    .catch((error) => {
      console.error('Error fetching domain data:', error);
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
          icon: [{ url: '' }],
          // apple: '/images/favicon/apple-touch-icon.png',
        },
      };
    });
};