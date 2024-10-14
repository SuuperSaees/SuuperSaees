import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export async function handleDomainCheck(request: NextRequest) {
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
  }
  return null;
}
