'use server';

import { getMailer } from '@kit/mailers';



import { getLanguageFromCookie } from '../../../../../../../../apps/web/lib/i18n/i18n.server';
import { getFormSendIdentity } from '../../orders/utils/get-form-send-identity';
import { getClientConfirmEmailTemplate } from './utils/client-confirm-email-template';


export const sendClientConfirmEmail = async (
  baseUrl: string,
  email: string,
  organizationLogo: string,
  organizationColor: string,
  textColor: string,
  sessionId: string,
  callbackUrl: string,
  organizationName: string,
  organizationId: string,
) => {
  const lang = getLanguageFromCookie() as 'en' | 'es';
  const { template, t } = getClientConfirmEmailTemplate(
    email,
    baseUrl,
    sessionId,
    callbackUrl,
    lang,
    organizationName,
    organizationLogo,
    organizationColor,
    textColor,
  );

  const mailer = await getMailer();
  const { fromSenderIdentity } = await getFormSendIdentity(
    organizationId,
    t('at'),
  );
  await mailer.sendEmail({
    to: email,
    from: fromSenderIdentity,
    subject: t('subject'),
    html: template,
  });
};