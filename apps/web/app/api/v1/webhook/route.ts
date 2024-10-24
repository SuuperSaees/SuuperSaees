import { NextResponse, NextRequest } from 'next/server';
import nodemailer from 'nodemailer';
import Stripe from 'stripe';
import { Readable } from 'stream';
import { createToken } from '../../../../../../packages/tokens/src/create-token';
import { Token } from '../../../../../../packages/tokens/src/domain/token-type';
import { getSupabaseServerComponentClient } from '../../../../../../packages/supabase/src/clients/server-component.client';
import { Subscription } from '~/lib/subscriptions.types';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const emailSender = process.env.EMAIL_SENDER ?? '';
const siteURL = process.env.NEXT_PUBLIC_SITE_URL ?? '';
export const config = {
  api: {
    bodyParser: false, 
  },
};
// Function to get the raw body of the request
async function getRawBody(readable: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const buf = await getRawBody(req.body as unknown as Readable);
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    if (err instanceof Error) {
      console.error(`⚠️  Webhook signature verification failed.`, err.message);
    } else {
      console.error(`⚠️  Webhook signature verification failed.`, err);
    }
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }
try {
  // Manage and respond to the event
  if (event.type === 'checkout.session.async_payment_failed') {
    console.log('Async payment failed:', event.data.object);
  } else if (event.type === 'checkout.session.async_payment_succeeded') {
    console.log('Async payment succeeded:', event.data.object);
  } else if (event.type === 'checkout.session.completed') {
    const dataObjectCheckoutPaymentSucceeded = event.data.object;
    const now = new Date();
    const tokenData: Token = {
      customer_email: dataObjectCheckoutPaymentSucceeded.customer_details?.email ?? '',
      customer_name: dataObjectCheckoutPaymentSucceeded.customer_details?.name ?? '',
      customer_id: typeof dataObjectCheckoutPaymentSucceeded.customer === 'string' ? dataObjectCheckoutPaymentSucceeded.customer : '',
      subscription_id: typeof dataObjectCheckoutPaymentSucceeded.subscription === 'string' ? dataObjectCheckoutPaymentSucceeded.subscription : '',
      expires_at: new Date(now.getTime() + 60 * 60 * 1000)
    };
    const { accessToken, tokenId } = await createToken(tokenData);
  
    // Create subscription in the database
    const client = getSupabaseServerComponentClient({
      admin: true,
    },);
    const newDate = now.toISOString();
    const newSubscription: Subscription.Insert = {
      id: dataObjectCheckoutPaymentSucceeded.subscription as string,
      active: true,
      billing_customer_id: dataObjectCheckoutPaymentSucceeded.customer as string,
      billing_provider: 'stripe',
      created_at: newDate,
      currency: 'usd',
      days_used: 7,
      status: 'active',
      token_id: tokenId,
      updated_at: newDate,
      account_id: null,
      cancel_at_period_end: false,
      period_ends_at: null,
      period_starts_at: null,
      propietary_organization_id: null,
      trial_ends_at: null,
      trial_starts_at: null,
    };
  
    const { error: subscriptionCreateError } = await client
      .from('subscriptions')
      .insert(newSubscription)
      .select('*')
      .single();
  
    if (subscriptionCreateError) {
      console.error('Error creating subscription:', subscriptionCreateError.message);
    }
  
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_TLS !== 'false', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      dkim: {
        domainName: process.env.EMAIL_DOMAIN,
        keySelector: 'mail', // DKIM selector
        privateKey: process.env.EMAIL_DKIM, // DKIM private key from environment variables
      },
    } as nodemailer.TransportOptions);
    const from = emailSender;
    const to = tokenData.customer_email;
    const subject = 'Create your account';
    const text = '';
    const html = `
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
                line-clamp-3;
              }
  
          </style>
        </head>
          <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
            Create your account to access the platform - Suuper
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
                                    <p style="color: var(--Gray-700, #344054);font-size:16px;font-style:normal;font-weight:700;line-height:24px;">Hi ${tokenData.customer_name}</p>
                                    <p style="color: var(--Gray-700, #344054);font-size:16px;font-style:normal;font-weight:400;line-height:24px;">
                                    Welcome to Suuper! You have successfully completed your payment. To access the platform, you need to create your account. Click the button below to create your account.
                                    </p>
  
                                    <!-- Contenedor centrado para el botón -->
                                    <div class="button-container">
                                      <a href="${siteURL}auth/sign-up?access-token=${accessToken}" class="button">
                                        Create account
                                      </a>
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
                                      This email was sent to ${to}. If you'd rather not receive this kind of email, you can unsubscribe or manage your email preferences.
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
    `;

    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
  } else if (event.type === 'checkout.session.expired') {
    console.log('Checkout session expired:', event.data.object);
  } else {
    console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({}, { status: 200 });
} catch (error) {
  console.error('Error processing event:', error);
  return NextResponse.json({}, { status: 200 });
}
}