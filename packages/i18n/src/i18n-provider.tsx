'use client';

import type { InitOptions, i18n } from 'i18next';

import { initializeI18nClient } from './i18n.client';
import { useEffect } from 'react';
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

  // Use the cookie value directly instead of making an API call
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cookieLang = document.cookie
        .split('; ')
        .find(row => row.startsWith('lang='))
        ?.split('=')[1];

      if (cookieLang && i18nInstance.language !== cookieLang) {
        i18nInstance.changeLanguage(cookieLang).catch((error) => {
          console.error('Error changing language:', error);
        });
      }
    }
  }, []);

  return i18nInstance;
}

async function loadI18nInstance(settings: InitOptions, resolver: Resolver) {
  i18nInstance = await initializeI18nClient(settings, resolver);
}
