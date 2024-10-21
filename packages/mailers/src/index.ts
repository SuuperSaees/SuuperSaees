import { z } from 'zod';



import enEmails from '../../../apps/web/public/locales/en/emails.json';
import esEmails from '../../../apps/web/public/locales/es/emails.json';

const MAILER_PROVIDER = z
  .enum(['nodemailer', 'cloudflare', 'resend', 'suupermailer'])
  .default('suupermailer')
  .parse(process.env.MAILER_PROVIDER);

/**
 * @description Get the mailer based on the environment variable.
 */
export async function getMailer() {
  switch (MAILER_PROVIDER) {
    case 'nodemailer':
      return getNodemailer();

    case 'cloudflare':
      return getCloudflareMailer();

    case 'resend':
      return getResendMailer();

    case 'suupermailer':
      return getSuuperMailer();

    default:
      throw new Error(`Invalid mailer: ${MAILER_PROVIDER as string}`);
  }
}

async function getNodemailer() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { Nodemailer } = await import('./impl/nodemailer');

    return new Nodemailer();
  } else {
    throw new Error(
      'Nodemailer is not available on the edge runtime. Please use another mailer.',
    );
  }
}

async function getCloudflareMailer() {
  const { CloudflareMailer } = await import('./impl/cloudflare');

  return new CloudflareMailer();
}

async function getResendMailer() {
  const { ResendMailer } = await import('./impl/resend');

  return new ResendMailer();
}

async function getSuuperMailer() {
  const { SuuperMailer } = await import('./impl/suuper-mailer');

  return new SuuperMailer();
}

type EmailTypes = keyof typeof enEmails;
type TranslationKeys<T extends EmailTypes> = keyof (typeof enEmails)[T];

const translations = {
  en: enEmails,
  es: esEmails,
};

export function getEmailTranslations<T extends EmailTypes>(emailType: T, lang: 'en' | 'es' = 'en') {
  const emailTranslations = translations[lang][emailType];

  return {
    t: (key: TranslationKeys<T>, replacements?: Record<string, string>) => {
      const rawText = emailTranslations[key];
      const text = typeof rawText === 'string' ? rawText : String(rawText);
      
      if (replacements) {
        return Object.entries(replacements).reduce((acc, [key, value]) => {
          return acc.replace(`\${${key}}`, value);
        }, text);
      }
      return text;
    },
    lang,
  };
}