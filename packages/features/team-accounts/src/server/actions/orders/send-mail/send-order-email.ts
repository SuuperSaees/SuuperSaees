'use server';

import { getMailer } from '@kit/mailers';
import { getEmailTranslations } from '@kit/mailers';
import { getLogger } from '@kit/shared/logger';

import { getLanguageFromCookie } from '../../../../../../../../apps/web/lib/i18n/i18n.server';
import { Order } from '../../../../../../../../apps/web/lib/order.types';
import { getDomainByUserId } from '../../../../../../../multitenancy/utils/get/get-domain';
import { getFormSendIdentity } from '../utils/get-form-send-identity';

export async function sendOrderCreationEmail(
  orderId: string,
  orderData: Order.Type,
  userId: string,
  clientName: string,
  clientOrgName: string
) {
  const logger = await getLogger();
  const mailer = await getMailer();


  if (!userId) {
    throw new Error('User id not found');
  }

  const {
    domain: siteURL,
    organizationId,
    ownerEmail,
    organization,
  } = await getDomainByUserId(userId, true, true);

  if (!organization || !ownerEmail) {
    throw new Error('Domain - organization not found');
  }

  const toEmail = ownerEmail;
  const agencyName = organization.name;

  const lang = getLanguageFromCookie() as 'en' | 'es';
  const { t } = getEmailTranslations('orderCreation', lang);

  const { fromSenderIdentity, logoUrl, themeColor, buttonTextColor } =
    await getFormSendIdentity(organizationId ?? '', t('at'));
      // Samuel Santa at Suuper
  const emailSender = `${clientName} ${t('at')} ${clientOrgName}`;
  
  await mailer
    .sendEmail({
      to: ownerEmail,
      from: fromSenderIdentity,
      subject: t('subject'),
      html: `
       <!DOCTYPE html>
        <html dir="ltr" lang="${lang}">
          <head>
            <meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/>
            <meta name="x-apple-disable-message-reformatting"/>
            <style>
                body {
                  background-color: #fff;
                  margin: auto;
                  font-family: sans-serif;
                  color: #484848;
                }
            </style>
          </head>
            <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
              ${t('body')}
            </div>
            <body>
              <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:37.5em;background-color:#fff;margin:auto;font-family:sans-serif;color:#484848">
                <tbody>
                  <tr style="width:100%">
                    <td>
                      <table align="center" width="100%" class="undefined" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:535px;background-color:#fff;margin:auto;margin-top:36px;margin-bottom:36px;margin-left:auto;margin-right:auto;padding-left:1rem;padding-right:1rem">
                        <tbody>
                          <tr style="width:100%">
                            <td>
                              <table
                                align="left"
                                width="100%"
                                border="0"
                                cellPadding="0"
                                cellSpacing="0"
                                role="presentation"
                                style="max-width:37.5em"
                              >
                                <tbody>
                                  <tr style="width:100%">
                                    <td style="text-align: left;">
                                      <img
                                        src="${logoUrl}"
                                        alt="Company Logo"
                                        style="width: 142px; height:auto; margin-bottom: 20px;"
                                      />
                                      <p style="color: var(--Gray-700, #344054);font-size:16px;font-style:normal;font-weight:700;line-height:24px;">${t('greeting', { toEmail })}</p>
                                      <p style="color: var(--Gray-700, #344054);font-size:16px;font-style:normal;font-weight:400;line-height:24px;">${t('newOrderMessage', { emailSender })}</p>
                                      <p style="color: var(--Gray-700, #344054);font-size:16px;font-style:normal;font-weight:700;line-height:24px;">${orderData.title}</p>
                                      <p style="color: var(--Gray-700, #344054);font-size:16px;font-style:normal;font-weight:400;line-height:24px;margin-bottom:60px;">${orderData.description}</p>
                                      <a href="${siteURL}orders/${orderId}" style="padding: 10px 20px; background-color: ${themeColor}; color: ${buttonTextColor}; text-decoration: none; border-radius: 5px;">
                                        ${t('viewOrder')}
                                      </a>
                                      <p style="color: var(--Gray-700, #344054);font-size:16px;font-style:normal;font-weight:400;line-height:24px;margin-top:40px;">${t('farewell')}</p>
                                      <p style="color: var(--Gray-700, #344054);font-size:16px;font-style:normal;font-weight:400;line-height:24px;">${agencyName}.</p>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              
                              <table
                                align="left"
                                width="100%"
                                border="0"
                                cellPadding="0"
                                cellSpacing="0"
                                role="presentation"
                                style="max-width:37.5em"
                              >
                                <tbody>
                                  <tr style="width:100%">
                                    <td style="text-align: left;">
                                      <p style="color: var(--Gray-600, #475467); font-size: 14px; font-style: normal; font-weight: 400; line-height: 20px; margin: 16px 0;">
                                        ${t('footer', { toEmail })}
                                      </p>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </body>
          </html>
    `,
    })
    .then(() => {
      logger.info('Order email successfully sent!');
    })
    .catch((error) => {
      console.error(error);
      logger.error({ error }, 'Failed to send order email');
    });
}
// <p style="color: var(--Gray-600, #475467); font-size: 14px; font-style: normal; font-weight: 400; line-height: 20px; margin: 16px 0;">
// © 2024 Suuper, soporte@suuper.co
// </p>
