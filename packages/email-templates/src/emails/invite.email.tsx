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
import { getEmailTranslations } from '../../../mailers/src';
import { getLanguageFromCookie } from '../../../../apps/web/lib/i18n/i18n.server';

interface Props {
  teamName: string;
  teamLogo?: string;
  inviter: string | undefined;
  invitedUserEmail: string;
  link: string;
  productName: string;
  language?: string;
  logoUrl?: string;
  primaryColor?: string;
}
function getTextColorBasedOnBackground(backgroundColor: string) {
  // Remove any hash symbol if it exists
  const color = backgroundColor.replace('#', '');

  // Convert the hex color to RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Calculate the luminance
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // Return 'black' for lighter backgrounds and 'white' for darker backgrounds
  return luminance > 186 ? 'black' : 'white'; // 186 is a common threshold for readability
}

export async function renderInviteEmail(props: Props) {
  const namespace = 'invite-email';
  const lang = getLanguageFromCookie() as 'en' | 'es';
  const { t: inviteEmailT } = getEmailTranslations('inviteEmail', lang);
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
    });

    // const joinTeam = t(`${namespace}:joinTeam`, {
    //   teamName: props.teamName,
    // });

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
                  color: ${getTextColorBasedOnBackground(props.primaryColor ? props.primaryColor : '#484848')};
                }
                .cta-button {
                  background-color: ${props.primaryColor ? props.primaryColor : '#1A38D7'};
                  color: #ffffff;
                  padding: 10px 20px;
                  text-decoration: none;
                  border-radius: 5px;
                }
                
       
            </style>
          </head>
            <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
              ${inviteEmailT('confirmEmail')} 
            </div>
            <body>
              <table align="left" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:37.5em;background-color:#fff;margin:auto;font-family:sans-serif;color:#484848">
                <tbody>
                  <tr style="width:100%">
                    <td>
                      <table align="left" width="100%" class="undefined" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:535px;background-color:#fff;margin:auto;margin-top:36px;margin-bottom:36px;margin-left:auto;margin-right:auto;padding-left:1rem;padding-right:1rem">
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
                                        src=${props.logoUrl ? props.logoUrl : 'https://ygxrahspvgyntzimoelc.supabase.co/storage/v1/object/public/account_image/suuper-logo.png'}
                                        alt="Company Logo"
                                        style="
                                        max-width: 142px; 
                                        height:auto;
                                        width:100%; 
                                        margin-bottom: 20px;
                                        "
                                      />

                                      <!-- Hola Text -->
                                  <p
                                    style="
                                      color: var(--Gray-700, #344054);
                                      font-size: 16px;
                                      font-style: normal;
                                      font-weight: 700;
                                      line-height: 24px;
                                      margin-bottom: 20px;
                                    "
                                  >
                                    ${hello}
                            </p>
                                      
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <table 
                                align="left" 
                                width="100%" 
                                class="undefined" 
                                border="0" 
                                cellPadding="0" 
                                cellSpacing="0" 
                                role="presentation" 
                                style="max-width:37.5em;border-radius:0.75rem;margin-top:8px;margin-bottom:8px;padding-top:12px;">
                                <tbody>
                                  <tr style="width:100%">
                                    <td>
                                      <p style="font-size:16px;line-height:24px; 0;color:rgb(0,0,0);">${mainText}</p>
                                      <table align="left" width="163px" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="margin-top:32px;margin-bottom:32px">
                                        <tbody>
                                          <tr>
                                            <td>
                                              <a href="${props.link}" class="cta-button"
                                              style="background-color:${props.primaryColor ? props.primaryColor : '#1A38D7'}; color: ${getTextColorBasedOnBackground(props.primaryColor ? props.primaryColor : '#1A38D7')}; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                              ${inviteEmailT('acceptInvitation')}
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
                                        ${inviteEmailT('footer', { toEmail: props.invitedUserEmail })}
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
    `;

    return {
      html,
      subject,
      t: inviteEmailT,
    };
  } catch (error) {
    console.error('Error al renderizar el correo:', error);
    throw error; // Re-lanza el error para que pueda ser manejado por el llamador si es necesario
  }
}

{/* <p style="color: var(--Gray-600, #475467); font-size: 14px; font-style: normal; font-weight: 400; line-height: 20px; margin: 16px 0;">
        © 2024 Suuper, soporte@suuper.co
</p> */}