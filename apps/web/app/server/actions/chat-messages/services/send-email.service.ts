'use server';

import { getMailer } from '@kit/mailers';
import { getEmailTranslations } from '@kit/mailers';
import { getLogger } from '@kit/shared/logger';

import { getLanguageFromCookie } from '~/lib/i18n/i18n.server';
import { getDomainByUserId } from '~/multitenancy/utils/get/get-domain';
import { getFormSendIdentity } from '~/team-accounts/src/server/actions/orders/utils/get-form-send-identity';

export async function sendChatMessageEmail(
  toEmail: string,
  senderName: string,
  message: string,
  chatTitle: string,
  userId: string,
) {
  const logger = await getLogger();
  const mailer = await getMailer();
  const { domain: siteURL, organizationId } = await getDomainByUserId(
    userId,
    true,
  );
  const lang = getLanguageFromCookie() as 'en' | 'es';
  const { t } = getEmailTranslations('chatMessage', lang);

  const subject = t('subject', {
    senderName,
    chatTitle,
  });

  const bodyMessage = t('body', {
    senderName,
    chatTitle,
    message,
  });

  const { fromSenderIdentity, logoUrl, themeColor, buttonTextColor } = await getFormSendIdentity(
    organizationId ?? '',
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
                  background-color: #f9fafb;
                  padding: 16px;
                  border-radius: 8px;
                  margin: 16px 0;
                  white-space: pre-wrap;
                }
            </style>
          </head>
            <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
              ${bodyMessage}
            </div>
            <body>
              <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:37.5em;background-color:#fff;margin:auto;font-family:sans-serif;color:#484848">
                <tbody>
                  <tr style="width:100%">
                    <td>
                      <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:535px;background-color:#fff;margin:36px auto;padding-left:1rem;padding-right:1rem">
                        <tbody>
                          <tr style="width:100%">
                            <td>
                              <table align="left" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                                <tbody>
                                  <tr style="width:100%">
                                    <td style="text-align: left;">
                                      <img
                                        src="${logoUrl}"
                                        alt="Company Logo"
                                        style="width: 142px; height: auto; margin-bottom: 20px;"
                                      />
                                      <p style="color:#344054;font-size:16px;font-weight:700;line-height:24px;">${t('greeting', { toName: toEmail.split('@')[0] ?? '' })}</p>
                                      <p style="color:#344054;font-size:16px;font-weight:400;line-height:24px;">${bodyMessage}</p>


                                      <div class="message">
                                        ${message}
                                      </div>

                                      <div class="button-container">
                                        <a href="${siteURL}/messages" class="button">
                                          ${t('viewMessage')}
                                        </a>
                                      </div>

                                      <div>
                                        <p style="color:#344054;font-size:16px;font-weight:400;margin:0;">${t('farewell')}</p>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              
                              <table align="left" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                                <tbody>
                                  <tr style="width:100%">
                                    <td style="text-align: left;">
                                      <p style="color:#475467;font-size:14px;font-weight:400;line-height:20px;margin:16px 0;">
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
      logger.info(`Chat message email sent successfully to ${toEmail}`);
    })
    .catch((error) => {
      console.error(error);
      logger.error({ error }, 'Error sending chat message email');
    });
}