'use client';

import type { InitOptions, i18n } from 'i18next';

import { initializeI18nClient } from './i18n.client';
import { getFullDomainBySubdomain } from '../../multitenancy/utils/get/get-domain';

let i18nInstance: i18n;

type Resolver = (
  lang: string,
  namespace: string,
) => Promise<Record<string, string>>;

export function I18nProvider({
  settings,
  children,
  resolver,
}: React.PropsWithChildren<{
  settings: InitOptions;
  resolver: Resolver;
}>) {
  useI18nClient(settings, resolver);

  return children;
}

/**
 * @name useI18nClient
 * @description A hook that initializes the i18n client.
 * @param settings
 * @param resolver
 */
function useI18nClient(settings: InitOptions, resolver: Resolver) {
  if (
    !i18nInstance ||
    i18nInstance.language !== settings.lng ||
    i18nInstance.options.ns?.length !== settings.ns?.length
  ) {
    throw loadI18nInstance(settings, resolver);
  }

  if (typeof window !== 'undefined') {
    getFullDomainBySubdomain(window.location.host, true)
      .then((domainFullData) => {
        if (domainFullData) {
          const databaseLanguage = domainFullData.settings.find(
            (setting) => setting.key === 'language'
          )?.value ?? 'en';
          
          console.log('databaseLanguage', databaseLanguage);
          i18nInstance.changeLanguage(databaseLanguage).catch((error) => {
            console.error('Error changing language:', error);
          });
        }
      })
      .catch((error) => {
        console.error('Error fetching domain data:', error);
      });
  }

  return i18nInstance;
}

async function loadI18nInstance(settings: InitOptions, resolver: Resolver) {
  i18nInstance = await initializeI18nClient(settings, resolver);
}
