'use client';

import type { InitOptions, i18n } from 'i18next';

import { initializeI18nClient } from './i18n.client';
import { getFullDomainBySubdomain } from '../../multitenancy/utils/get/get-domain';
import { useQuery } from '@tanstack/react-query';
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

  const LANGUAGE_KEY = 'language';
  const values = [LANGUAGE_KEY];

  const queryGetFullDomainBySubdomain = useQuery({
    queryKey: ['getFullDomainBySubdomain'],
    queryFn: async () => {
      console.log('query executed')
      const domainFullData = await getFullDomainBySubdomain(window.location.host, true, values);
      if(domainFullData){
        const databaseLanguage = domainFullData.settings.find(
          (setting) => setting.key === 'language'
        )?.value ?? 'en';
        
        i18nInstance.changeLanguage(databaseLanguage).catch((error) => {
          console.error('Error changing language:', error);
        });
      }
      return 
    },
    enabled: typeof window !== 'undefined',
  });

  queryGetFullDomainBySubdomain

  // if (typeof window !== 'undefined') {
  //   getFullDomainBySubdomain(window.location.host, true, values)  
  //     .then((domainFullData) => {
  //       if (domainFullData) {
  //         const databaseLanguage = domainFullData.settings.find(
  //           (setting) => setting.key === 'language'
  //         )?.value ?? 'en';
          
  //         i18nInstance.changeLanguage(databaseLanguage).catch((error) => {
  //           console.error('Error changing language:', error);
  //         });
  //       }
  //     })
  //     .catch((error) => {
  //       console.error('Error fetching domain data:', error);
  //     });
  // }

  return i18nInstance;
}

async function loadI18nInstance(settings: InitOptions, resolver: Resolver) {
  i18nInstance = await initializeI18nClient(settings, resolver);
}
