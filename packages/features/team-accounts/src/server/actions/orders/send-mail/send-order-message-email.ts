'use server';

import { getMailer } from '@kit/mailers';
import { getEmailTranslations } from '@kit/mailers';
import { getLogger } from '@kit/shared/logger';



import { getLanguageFromCookie } from '../../../../../../../../apps/web/lib/i18n/i18n.server';
import { getDomainByUserId } from '../../../../../../../multitenancy/utils/get/get-domain';
import { getFormSendIdentity } from '../utils/get-form-send-identity';


export async function sendOrderMessageEmail(
  toEmail: string,
  userName: string,
  orderId: string,
  orderTitle: string,
  message: string,
  agencyName: string,
  date: string,
  userId: string,
) {
  const logger = await getLogger();
  const mailer = await getMailer();
  const lang = getLanguageFromCookie() as 'en' | 'es';
  const { t } = getEmailTranslations('orderMessage', lang);
  const { domain: siteURL, organizationId } = await getDomainByUserId(
    userId,
    true,
  );
  const subject = t('subject', { userName, orderTitle, date });

  const { fromSenderIdentity, logoUrl, themeColor, buttonTextColor } = await getFormSendIdentity(
    organizationId,
    t('at'),
  );

  await mailer
    .sendEmail({
      to: toEmail,
      from: fromSenderIdentity,
      subject: subject,
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
                .button-container {
                  text-align: left;
                  margin: 20px 0;
                }
                .button {
                  padding: 10px 20px;
                  background-color: ${themeColor};
                  color: ${buttonTextColor};
                  text-decoration: none;
                  border-radius: 5px;
                  display: inline-block;
                }
                .message {
                  overflow: auto;
                  margin: 16px 0;
                  line-height: 1.6;
                  line-clamp-3;
                }
            </style>
          </head>
            <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
              ${subject}
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
                                        style="width: 142px; height: auto; margin-bottom: 20px;"
                                      />
                                      <p style="color: var(--Gray-700, #344054);font-size:16px;font-style:normal;font-weight:700;line-height:24px;">${t('greeting', { toEmail })}</p>
                                      <p style="color: var(--Gray-700, #344054);font-size:16px;font-style:normal;font-weight:400;line-height:24px;">${t('subject', { userName, orderTitle, date })}</p>
                                      <div class="message">
                                        <p style="color: var(--Gray-700, #344054);font-size:16px;font-style:normal;font-weight:400;line-height:30px;">${message}</p>
                                      </div>

                                      <!-- Contenedor centrado para el botón -->
                                      <div class="button-container">
                                        <a href="${siteURL}orders/${orderId}" class="button">
                                          ${t('reply')}
                                        </a>
                                      </div>

                                      <div class="">
                                        <p style="color: var(--Gray-700, #344054); font-size: 16px; font-style: normal; font-weight: 400; margin:0;">${t('farewell')}</p>
                                        <p style="color: var(--Gray-700, #344054); font-size: 16px; font-style: normal; font-weight: 700; margin:0;">${agencyName}</p>
                                      </div>

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
      logger.info('Order message email sent successfully.');
    })
    .catch((error) => {
      console.error(error);
      logger.error({ error }, 'Error sending the order email');
    });
}

// <p style="color: var(--Gray-600, #475467); font-size: 14px; font-style: normal; font-weight: 400; line-height: 20px; margin: 16px 0;">
// © 2024 Suuper, soporte@suuper.co
// </p>