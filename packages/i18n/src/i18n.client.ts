import i18next, { type InitOptions, i18n } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

let clientInstance: i18n | null = null;

/**
 * Initialize the i18n instance on the client.
 * @param settings - the i18n settings
 * @param resolver - a function that resolves the i18n resources
 */
export async function initializeI18nClient(
  settings: InitOptions,
  resolver: (lang: string, namespace: string) => Promise<object>,
): Promise<i18n> {
  if (clientInstance) {
    return Promise.resolve(clientInstance);
  }

  const loadedLanguages: string[] = [];
  const loadedNamespaces: string[] = [];

  await i18next
    .use(
      resourcesToBackend(async (language, namespace, callback) => {
        const data = await resolver(language, namespace);

        if (!loadedLanguages.includes(language)) {
          loadedLanguages.push(language);
        }

        if (!loadedNamespaces.includes(namespace)) {
          loadedNamespaces.push(namespace);
        }

        return callback(null, data);
      }),
    )
    .use(LanguageDetector)
    .use(initReactI18next)
    .init(
      {
        ...settings,
        detection: {
          order: ['htmlTag', 'cookie', 'navigator'],
          caches: ['cookie'],
          lookupCookie: 'lang',
        },
        interpolation: {
          escapeValue: false,
        },
      },
      (err) => {
        if (err) {
          console.error('Error initializing i18n client', err);
        }
      },
    );

  // keep component suspended until all languages and namespaces are loaded

  if (loadedNamespaces.length !== settings.ns?.length) {
    throw new Error();
  }

  if (
    loadedLanguages.length !==
    ((settings.supportedLngs as string[]) ?? [])?.length
  ) {
    throw new Error();
  }

  clientInstance = i18next;

  return clientInstance;
}
