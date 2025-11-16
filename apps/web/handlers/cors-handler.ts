import 'server-only';

import { NextRequest, NextResponse } from 'next/server';

export function handleCors(
  request: NextRequest,
  response: NextResponse,
  domain: string,
) {
  const origin = request.nextUrl.origin;
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin':
          origin === `https://${domain}` ? origin : '',
        'Access-Control-Allow-Methods':
          'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization',
  );
  response.headers.set('Access-Control-Allow-Origin', origin);
  return null;
}
