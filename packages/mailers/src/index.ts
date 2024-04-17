import { z } from 'zod';

const MAILER_PROVIDER = z
  .enum(['nodemailer', 'cloudflare'])
  .default('nodemailer')
  .parse(process.env.MAILER_PROVIDER);

/**
 * @description Get the mailer based on the environment variable.
 */
export async function getMailer() {
  switch (process.env.MAILER_PROVIDER as typeof MAILER_PROVIDER) {
    case 'nodemailer': {
      if (process.env.NEXT_RUNTIME !== 'edge') {
        const { Nodemailer } = await import('./impl/nodemailer');

        return new Nodemailer();
      } else {
        throw new Error('Nodemailer is not available on the edge runtime side');
      }
    }

    case 'cloudflare': {
      const { CloudflareMailer } = await import('./impl/cloudflare');

      return new CloudflareMailer();
    }

    default:
      throw new Error(`Invalid mailer: ${MAILER_PROVIDER as string}`);
  }
}
