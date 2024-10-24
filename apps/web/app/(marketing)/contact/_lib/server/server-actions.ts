'use server';

import { z } from 'zod';

import { getEmailTranslations, getMailer } from '@kit/mailers';
import { enhanceAction } from '@kit/next/actions';
import { getLanguageFromCookie } from '~/lib/i18n/i18n.server';
import { ContactEmailSchema } from '../contact-email.schema';

const contactEmail = z
  .string({
    description: `The email where you want to receive the contact form submissions.`,
    required_error:
      'Contact email is required. Please use the environment variable CONTACT_EMAIL.',
  })
  .parse(process.env.CONTACT_EMAIL);

const emailFrom = z
  .string({
    description: `The email sending address.`,
    required_error:
      'Sender email is required. Please use the environment variable EMAIL_SENDER.',
  })
  .parse(process.env.EMAIL_SENDER);

export const sendContactEmail = enhanceAction(
  async (data) => {
    const lang = getLanguageFromCookie() as 'en' | 'es';
    const mailer = await getMailer();
    const { t } = getEmailTranslations('contactFormSubmission', lang);
    await mailer.sendEmail({
      to: contactEmail,
      from: emailFrom,
      subject: t('subject'),
      html: `
      <!DOCTYPE html>
      <html lang="${lang}">
        <head>
          <meta charset="utf-8">
          <title>${t('subject')}</title>
        </head>
        <body>
          <p>${t('body')}</p>
          <p>${t('name', { name: data.name })}</p>
          <p>${t('email', { email: data.email })}</p>
          <p>${t('message', { message: data.message })}</p>
        </body>
      </html>
    `,
    });

    return {};
  },
  {
    schema: ContactEmailSchema,
    auth: false,
  },
);