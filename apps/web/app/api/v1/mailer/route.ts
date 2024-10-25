import { NextRequest, NextResponse } from 'next/server';



import nodemailer from 'nodemailer';


export async function POST(req: NextRequest) {
  const { from, to, subject, text, html } = await req.json();
  const missingFields = [];
  if (!from) missingFields.push('from');
  if (!to) missingFields.push('to');
  if (!subject) missingFields.push('subject');
  if (missingFields.length > 0) {
    // Respuesta de error por campos faltantes
    const errorResponse = {
      code: 400, // Bad Request
      message: 'Missing required fields',
      error: 'Bad Request',
      details: missingFields,
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }
  console.log('process.env.EMAIL_HOST', process.env.EMAIL_HOST);
  // Configure the transporter
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
    console.error('Error sending email', error);
    const errorResponse = {
      code: 500,
      message: 'Failed to send email',
      error: 'Internal Server Error',
      details: [(error as Error).message],
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}