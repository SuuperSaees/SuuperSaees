import 'server-only';

import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export async function handleDomainCheck(
  request: NextRequest,
  response: NextResponse,
) {
  const IS_PROD = process.env.NEXT_PUBLIC_IS_PROD === 'true';
  const origin = request.nextUrl.origin;
  const originDomain = new URL(origin).host;
  const baseUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? '').host;

  if (IS_PROD && originDomain !== baseUrl) {
    const supabaseClient = getSupabaseServerComponentClient({ admin: true });
    const { error: domainsError } = await supabaseClient
      .from('subdomains')
      .select('domain')
      .eq('domain', originDomain)
      .single();

    if (domainsError) {
      const landingPage = process.env.NEXT_PUBLIC_LANDING_URL ?? '';
      return NextResponse.redirect(new URL(landingPage, origin).href);
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin':
            origin === `https://${originDomain}` ? origin : '',
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
  }
  return null;
}