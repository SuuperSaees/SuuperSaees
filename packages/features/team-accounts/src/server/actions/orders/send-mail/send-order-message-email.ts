'use server';

import { getMailer } from '@kit/mailers';
import { getLogger } from '@kit/shared/logger';



import { getDomainByUserId } from '../../../../../../../multitenancy/utils/get/get-domain';


const emailSender = process.env.EMAIL_SENDER ?? '';

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
  const siteURL = await getDomainByUserId(userId, true);
  await mailer
    .sendEmail({
      to: toEmail,
      from: emailSender,
      subject: `${userName} commented in ${orderTitle} on ${date}.`,
      html: `
       <!DOCTYPE html>
        <html dir="ltr" lang="es">
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
                  background-color: #1A38D7;
                  color: white;
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
              ${userName} commented in ${orderTitle} on ${date}.
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
                                        src="https://ygxrahspvgyntzimoelc.supabase.co/storage/v1/object/public/account_image/suuper-logo.png"
                                        alt="Suuper Logo"
                                        style="width: 142px; height: 32px; margin-bottom: 20px;"
                                      />
                                      <p style="color: var(--Gray-700, #344054);font-size:16px;font-style:normal;font-weight:700;line-height:24px;">Hi ${toEmail}</p>
                                      <p style="color: var(--Gray-700, #344054);font-size:16px;font-style:normal;font-weight:400;line-height:24px;">${userName} commented in ${orderTitle} on ${date}.</p>
                                      <div class="message">
                                        <p style="color: var(--Gray-700, #344054);font-size:16px;font-style:normal;font-weight:400;line-height:30px;">${message}</p>
                                      </div>

                                      <!-- Contenedor centrado para el botón -->
                                      <div class="button-container">
                                        <a href="${siteURL}orders/${orderId}" class="button">
                                          Reply
                                        </a>
                                      </div>

                                      <div class="">
                                        <p style="color: var(--Gray-700, #344054); font-size: 16px; font-style: normal; font-weight: 400; margin:0;">Regards,</p>
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
                                        This email was sent to ${toEmail}. If you'd rather not receive this kind of email, you can unsubscribe or manage your email preferences.
                                      </p>
                                      <p style="color: var(--Gray-600, #475467); font-size: 14px; font-style: normal; font-weight: 400; line-height: 20px; margin: 16px 0;">
                                        © 2024 Suuper, soporte@suuper.co
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
      logger.info('Correo de mensaje de pedido enviado con éxito.');
    })
    .catch((error) => {
      console.error(error);
      logger.error({ error }, 'Error al enviar el correo de pedido');
    });
}