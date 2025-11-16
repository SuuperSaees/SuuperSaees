import { getEmailTranslations } from '@kit/mailers';

const typeEmailTranslations = {
  confirm: 'clientConfirmEmail',
  recovery: 'clientRecoveryEmail',
  invitation: 'clientInvitationEmail',
  reactivation: 'clientConfirmEmail',
  update_email: 'clientUpdateEmail',
} as const;

export const getClientConfirmEmailTemplate = (
  toEmail: string,
  baseUrl: string,
  sessionId: string,
  callbackUrl: string,
  lang: 'en' | 'es',
  agencyName: string,
  agencyLogo: string,
  agencyColor: string,
  textColor: string,
  type: 'confirm' | 'recovery' | 'invitation' | 'reactivation' | 'update_email' = 'confirm',
) => {
  const { t } = getEmailTranslations(typeEmailTranslations[type], lang);
  const template = `
  <!doctype html>
<html dir="ltr" lang="${lang}">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <style>
      body {
        background-color: #fff;
        margin: auto;
        font-family: sans-serif;
        color: #484848;
      }
    </style>
  </head>
  <div
    style="
      display: none;
      overflow: hidden;
      line-height: 1px;
      opacity: 0;
      max-height: 0;
      max-width: 0;
    "
  >
    ${t('subject')} - ${agencyName ?? 'Suuper'}
  </div>
  <body>
    <table
      align="center"
      width="100%"
      border="0"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="
        max-width: 37.5em;
        background-color: #fff;
        margin: auto;
        font-family: sans-serif;
        color: #484848;
      "
    >
      <tbody>
        <tr style="width: 100%">
          <td>
            <table
              align="center"
              width="100%"
              class="undefined"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="
                max-width: 535px;
                background-color: #fff;
                margin: auto;
                margin-top: 36px;
                margin-bottom: 36px;
                margin-left: auto;
                margin-right: auto;
                padding-left: 1rem;
                padding-right: 1rem;
              "
            >
              <tbody>
                <tr style="width: 100%">
                  <td>
                    <table
                      align="left"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="max-width: 37.5em"
                    >
                      <tbody>
                        <tr style="width: 100%">
                          <td style="text-align: left">
                            <img
                              src=${agencyLogo}
                              alt="Logo de la empresa"
                              style="
                                 max-width: 142px; 
                                 height:auto;
                                 width:100%; 
                                 margin-bottom: 20px;
                              "
                            />
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
                              ${t('greeting', { toEmail })}
                            </p>
                            <p
                              style="
                                color: var(--Gray-700, #344054);
                                font-size: 16px;
                                font-style: normal;
                                font-weight: 400;
                                line-height: 24px;
                                margin-bottom: 20px;
                              "
                            >
                              ${t('body', { agencyName })}
                            </p>
                            <p
                              style="
                                color: var(--Gray-700, #344054);
                                font-size: 16px;
                                font-style: normal;
                                font-weight: 400;
                                line-height: 24px;
                                margin-bottom: 20px;
                              "
                            >
                              <span>${t('yourUsername')}</span>
                              <br />
                              <span
                                style="
                                  color: var(--Gray-700, #344054);
                                  font-size: 16px;
                                  font-style: normal;
                                  font-weight: 400;
                                  line-height: 24px;
                                "
                              >
                                ${toEmail}
                              </span>
                            </p>

                            <a
                              href="${type === 'confirm' ? `${baseUrl}/auth/confirm?token_hash_session=${sessionId}&amp;type=invite&amp;callback=${callbackUrl}` : `${callbackUrl}`}"
                              style="
                                line-height: 100%;
                                text-decoration: none;
                                display: inline-block;
                                max-width: 163px;
                                width: auto;
                                background-color: ${agencyColor};
                                border-radius: 8px;
                                color: ${textColor};
                                font-size: 14px;
                                font-weight: 600;
                                text-align: center;
                                padding: 10px 16px;
                                border: 2px solid rgba(255, 255, 255, 0.12);
                                box-shadow:
                                  0px 0px 0px 1px rgba(16, 24, 40, 0.18) inset,
                                  0px -2px 0px 0px rgba(16, 24, 40, 0.05) inset,
                                  0px 1px 2px 0px rgba(16, 24, 40, 0.05);
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                gap: 6px;
                                margin-bottom: 20px;
                              "
                              target="_blank"
                            >
                              <span
                                style="
                                  max-width: 100%;
                                  display: inline-block;
                                  line-height: 120%;
                                  mso-padding-alt: 0px;
                                  mso-text-raise: 9px;
                                "
                                >${t('activateAccount')}</span
                              >
                            </a>
                            <p
                              style="
                                color: var(--Gray-700, #344054);
                                font-size: 16px;
                                font-style: normal;
                                font-weight: 400;
                                line-height: 24px;
                              "
                            >
                              <span> ${t('thanks')} </span>
                              <br />
                              <span> ${t('team')} </span>
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
  </body>
</html>

  `;
  return { template, t };
};