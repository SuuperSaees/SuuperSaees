interface TemplateProps {
  subject: string;
  body: string;
  greeting: string;
  farewell: string;
  buttonText?: string;
  buttonUrl?: string;
  footer: string;
  additionalMessage?: string;
  logoUrl: string;
  themeColor: string;
  buttonTextColor: string;
  siteURL: string;
  lang: string;
  agencyName: string;
}

export function generateHtmlTemplate(props: TemplateProps): string {
  const {
    subject,
    body,
    greeting,
    farewell,
    buttonText,
    buttonUrl,
    footer,
    additionalMessage,
    logoUrl,
    themeColor,
    buttonTextColor,
    lang,
    agencyName,
  } = props;

  return `
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
            margin: 20px 0 30px 0;
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
            margin: 16px 0;
            line-height: 1.6;
          }
          .additional-message {
            background-color: #f9fafb;
            padding: 16px;
            border-radius: 8px;
            margin: 16px 0;
            white-space: pre-wrap;
          }
          .farewell-section {
            margin-top: 20px;
            margin-bottom: 20px;
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
                <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:535px;background-color:#fff;margin:auto;margin-top:36px;margin-bottom:36px;margin-left:auto;margin-right:auto;padding-left:1rem;padding-right:1rem">
                  <tbody>
                    <tr style="width:100%">
                      <td>
                        <table align="left" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:37.5em">
                          <tbody>
                            <tr style="width:100%">
                              <td style="text-align: left;">
                                <img
                                  src="${logoUrl}"
                                  alt="Company Logo"
                                  style="width: 142px; height: auto; margin-bottom: 20px;"
                                />
                                <p style="color: var(--Gray-700, #344054);font-size:16px;font-style:normal;font-weight:700;line-height:24px;">
                                  ${greeting}
                                </p>
                                ${body ? `<p style="color: var(--Gray-700, #344054);font-size:16px;font-style:normal;font-weight:400;line-height:24px;">${body}</p>` : ""}
                                
                                ${
                                  additionalMessage
                                    ? `
                                  <div class="additional-message">
                                    <p style="color: var(--Gray-700, #344054);font-size:16px;font-style:normal;font-weight:400;line-height:30px;margin:0;">
                                      ${additionalMessage}
                                    </p>
                                  </div>
                                `
                                    : ""
                                }

                                ${
                                  buttonText && buttonUrl
                                    ? `
                                  <div style="text-align: left; margin: 20px 0 25px 0;">
                                    <a href="${buttonUrl}" style="padding: 10px 20px; background-color: ${themeColor}; color: ${buttonTextColor}; text-decoration: none; border-radius: 5px; display: inline-block;">
                                      ${buttonText}
                                    </a>
                                  </div>
                                `
                                    : ""
                                }

                                <div style="margin-top: 20px; margin-bottom: 20px;">
                                  <p style="color: var(--Gray-700, #344054); font-size: 16px; font-style: normal; font-weight: 400; margin:0; margin-bottom: 5px;">${farewell}</p>
                                  <p style="color: var(--Gray-700, #344054); font-size: 16px; font-style: normal; font-weight: 700; margin:0;">${agencyName}</p>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        
                        <table align="left" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:37.5em">
                          <tbody>
                            <tr style="width:100%">
                              <td style="text-align: left;">
                                <p style="color: var(--Gray-600, #475467); font-size: 14px; font-style: normal; font-weight: 400; line-height: 20px; margin: 16px 0;">
                                  ${footer}
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
} 