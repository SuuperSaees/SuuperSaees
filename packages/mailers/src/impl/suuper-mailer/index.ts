// import 'server-only';
import { z } from 'zod';

import { Mailer } from '../../mailer';
import { MailerSchema } from '../../schema/mailer.schema';

type Config = z.infer<typeof MailerSchema>;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

const SUUPER_CLIENT_ID = z
  .string({
    description: 'The Client id for the Suuper API',
    required_error: 'Please provide the client id for the Suuper API',
  })
  .parse(process.env.NEXT_PUBLIC_SUUPER_CLIENT_ID);

const SUUPER_CLIENT_SECRET = z
  .string({
    description: 'The Client secret for the Suuper API',
    required_error: 'Please provide the client secret for the Suuper API',
  })
  .parse(process.env.NEXT_PUBLIC_SUUPER_CLIENT_SECRET);

/**
 * A class representing a mailer using the Suuper HTTP API.
 * @implements {Mailer}
 */
export class SuuperMailer implements Mailer {
  async sendEmail(config: Config) {
    const contentObject =
      'text' in config
        ? {
            text: config.text,
          }
        : {
            html: config.html,
          };
    const res = await fetch(`${baseUrl}/api/v1/mailer`, {
      method: 'POST',
      headers: new Headers({
        Authorization: `Basic ${btoa(`${SUUPER_CLIENT_ID}:${SUUPER_CLIENT_SECRET}`)}`,
      }),
      body: JSON.stringify({
        from: config.from,
        to: [config.to],
        subject: config.subject,
        ...contentObject,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to send email: ${res.statusText}`);
    }
  }
}
