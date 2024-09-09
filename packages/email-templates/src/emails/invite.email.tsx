// import {
//   Body,
//   Column,
//   Head,
//   Hr,
//   Html,
//   Img,
//   Link,
//   Preview,
//   Row,
//   Section,
//   Tailwind,
//   Text,
//   render,
// } from '@react-email/components';

// import { BodyStyle } from '../components/body-style';
// import { EmailContent } from '../components/content';
// import { CtaButton } from '../components/cta-button';
// import { EmailFooter } from '../components/footer';
// import { EmailHeader } from '../components/header';
// import { EmailHeading } from '../components/heading';
// import { EmailWrapper } from '../components/wrapper';
import { initializeEmailI18n } from '../lib/i18n';

interface Props {
  teamName: string;
  teamLogo?: string;
  inviter: string | undefined;
  invitedUserEmail: string;
  link: string;
  productName: string;
  language?: string;
}

export async function renderInviteEmail(props: Props) {
  const namespace = 'invite-email';

  try {
    const { t } = await initializeEmailI18n({
      language: props.language,
      namespace,
    });

    // const previewText = `Join ${props.invitedUserEmail} on ${props.productName}`;
    const subject = t(`${namespace}:subject`);

    // const heading = t(`${namespace}:heading`, {
    //   teamName: props.teamName,
    //   productName: props.productName,
    // });

    const hello = t(`${namespace}:hello`, {
      invitedUserEmail: props.invitedUserEmail,
    });

    const mainText = t(`${namespace}:mainText`, {
      inviter: props.inviter,
      teamName: props.teamName,
      productName: props.productName,
    });

    const joinTeam = t(`${namespace}:joinTeam`, {
      teamName: props.teamName,
    });
    const html = `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><!DOCTYPE html>
        <html dir="ltr" lang="en">
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
                .cta-button {
                  background-color:#1A38D7;
                  color: #ffffff;
                  padding: 10px 20px;
                  text-decoration: none;
                  border-radius: 5px;
                }
            </style>
          </head>
            <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
              Confirma tu correo - Suuper
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
                                      <!-- Logo -->
                                      <img
                                        src="https://ygxrahspvgyntzimoelc.supabase.co/storage/v1/object/public/account_image/Suuper%20Logo.svg"
                                        alt="Suuper Logo"
                                        style="width: 142px; height: 32px; margin-bottom: 20px;"
                                      />

                                      <!-- New Image -->
                                      <img
                                        src="https://ygxrahspvgyntzimoelc.supabase.co/storage/v1/object/public/account_image/a81567d28893e15cd0baf517c39f52ee.jpg"
                                        alt="Welcome"
                                        style="width: 100%; max-width: 100%; height: auto; margin-bottom: 20px;"
                                      />

                                      <!-- Hola Text -->
                                      <h1 
                                        style="color: var(--Gray-900, #101828); font-size: 36px; font-style: normal; font-weight: 600; line-height: 44px; letter-spacing: -0.72px; margin-left: 0px; margin-right: 0px;">
                                        ${hello}
                                      </h1>
                                      
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <table 
                                align="center" 
                                width="100%" 
                                class="undefined" 
                                border="0" 
                                cellPadding="0" 
                                cellSpacing="0" 
                                role="presentation" 
                                style="max-width:37.5em;border-radius:0.75rem;margin-top:8px;margin-bottom:8px;padding-top:12px;padding-bottom:12px;margin-left:auto;margin-right:auto;border-width:1px;border-style:solid;border-color:rgb(238,238,238)">
                                <tbody>
                                  <tr style="width:100%">
                                    <td>
                                      <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">${mainText}</p>
                                      <table align="left" width="163px" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="text-align:center;margin-top:32px;margin-bottom:32px">
                                        <tbody>
                                          <tr>
                                            <td>
                                              <a href="${props.link}" class="cta-button">${joinTeam}</a>
                                              </a>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
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
                                        Este correo fue enviado a ${props.invitedUserEmail}. Si prefieres no recibir este tipo de correos, puedes darte de baja o gestionar tus preferencias.
                                      </p>
                                      <p style="color: var(--Gray-600, #475467); font-size: 14px; font-style: normal; font-weight: 400; line-height: 20px; margin: 16px 0;">
                                        © 2024 Suuper, soporte@suuper.co
                                      </p>
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
                                      <!-- Logo -->
                                      <img
                                        src="https://ygxrahspvgyntzimoelc.supabase.co/storage/v1/object/public/account_image/Suuper%20Logo.svg"
                                        alt="Suuper Logo"
                                        style="width: 142px; height: 32px; margin-bottom: 20px;"
                                      />
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
    `;

    return {
      html,
      subject,
    };
  } catch (error) {
    console.error('Error al renderizar el correo:', error);
    throw error; // Re-lanza el error para que pueda ser manejado por el llamador si es necesario
  }
}