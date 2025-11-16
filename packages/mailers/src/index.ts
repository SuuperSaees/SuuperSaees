import { z } from 'zod';



import { EmailsTemplates } from '../../../apps/web/lib/emails-templates.types';
import enEmails from '../../../apps/web/public/locales/en/emails.json';
import esEmails from '../../../apps/web/public/locales/es/emails.json';


// import type { TFunction } from '../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index';


const MAILER_PROVIDER = z
  .enum(['nodemailer', 'cloudflare', 'resend', 'suupermailer'])
  .default('suupermailer')
  .parse(process.env.MAILER_PROVIDER);

/**
 * @description Get the mailer based on the environment variable.
 */
export async function getMailer() {
  switch (MAILER_PROVIDER) {
    // case 'nodemailer':
    //   return getNodemailer();

    // case 'cloudflare':
    //   return getCloudflareMailer();

    // case 'resend':
    //   return getResendMailer();

    // IMPORTANT: If you want to add a new mailer, you need to add it here or enable resend, nodemailer or cloudflare.

    case 'suupermailer':
      return await getSuuperMailer();

    default:
      throw new Error(`Invalid mailer: ${MAILER_PROVIDER as string}`);
  }
}

// async function getNodemailer() {
//   if (process.env.NEXT_RUNTIME === 'nodejs') {
//     const { Nodemailer } = await import('./impl/nodemailer');

//     return new Nodemailer();
//   } else {
//     throw new Error(
//       'Nodemailer is not available on the edge runtime. Please use another mailer.',
//     );
//   }
// }

// async function getCloudflareMailer() {
//   const { CloudflareMailer } = await import('./impl/cloudflare');

//   return new CloudflareMailer();
// }

// async function getResendMailer() {
//   const { ResendMailer } = await import('./impl/resend');

//   return new ResendMailer();
// }

async function getSuuperMailer() {
  const { SuuperMailer } = await import('./impl/suuper-mailer');

  return new SuuperMailer();
}

type EmailTypes = EmailsTemplates.EmailTypes;
type TranslationKeys<T extends EmailTypes> = EmailsTemplates.TranslationKeys<T>;

const translations = {
  en: enEmails,
  es: esEmails,
};

// type TEmailFunction<T extends EmailTypes> = TFunction<'emails', undefined> & {
//   key: TranslationKeys<T>;
//   replacements?: Record<string, string>;
// };
type TranslationObject = Record<string, string | Record<string, string>>;

export function getEmailTranslations<T extends EmailTypes>(emailType: T, lang: 'en' | 'es' = 'en') {
  const emailTranslations = translations[lang][emailType];

  return {
    t: ((key: TranslationKeys<T>, replacements?: Record<string, string>) => {
      const keyPath = (key as string).split('.');
      
      const rawText = keyPath.reduce((obj: TranslationObject, key) => {
        return (obj?.[key] ?? {}) as TranslationObject;
      }, emailTranslations as TranslationObject);

      // Handle undefined or non-string values
      if (rawText === undefined) {
        console.warn(`Translation key not found: ${key as string}`);
        return key;
      }

      const text = typeof rawText === 'string' ? rawText : String(rawText);
      
      if (replacements) {
        return Object.entries(replacements).reduce((acc, [key, value]) => {
          return acc.replace(`\${${key}}`, value);
        }, text);
      }
      return text;
    }),
    lang,
  };
}