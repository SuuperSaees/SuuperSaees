import nodemailer from 'nodemailer';
import { NextResponse, NextRequest} from 'next/server';

export async function POST(req: NextRequest) {
  const { from, to, subject, text, html } = await req.json();
  // Configure the transporter
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // Change this to your SMTP host
    port: Number(process.env.EMAIL_PORT), // Change this according to your configuration
    secure: process.env.EMAIL_TLS !== 'false', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // Your SMTP username
      pass: process.env.EMAIL_PASSWORD, // Your SMTP password
    },
    dkim: {
      domainName: process.env.EMAIL_DOMAIN, // Your domain
      keySelector: 'mail', // DKIM selector
      privateKey: process.env.EMAIL_DKIM, // DKIM private key from environment variables
    },
  });

  try {
    // Send the email
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    // Success response
    const successResponse = {
      code: 200,
      message: 'Email sent successfully',
      data: {},
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    // Error response
    const errorResponse = {
      code: 500,
      message: 'Failed to send email',
      error: 'Internal Server Error',
      details: [error],
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
