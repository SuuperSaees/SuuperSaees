import { NextRequest, NextResponse } from 'next/server';

import { type EmailOtpType } from '@supabase/supabase-js';

import { getSupabaseRouteHandlerClient } from '@kit/supabase/route-handler-client';

import pathsConfig from '~/config/paths.config';

const defaultNextUrl = pathsConfig.app.home;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? defaultNextUrl;
  const callbackParam = searchParams.get('callback');
  const callbackUrl = callbackParam ? new URL(callbackParam) : null;
  const inviteToken = callbackUrl?.searchParams.get('invite_token');
  const redirectTo = request.nextUrl.clone();

  redirectTo.pathname = next;

  // if we have an invite token, we append it to the redirect url
  if (inviteToken) {
    // if we have an invite token, we redirect to the join team page
    // instead of the default next url. This is because the user is trying
    // to join a team and we want to make sure they are redirected to the
    // correct page.
    redirectTo.pathname = pathsConfig.app.joinTeam;
    redirectTo.searchParams.set('invite_token', inviteToken);
  }

  if (token_hash && type) {
    const supabase = getSupabaseRouteHandlerClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
  }

  // return the user to an error page with some instructions
  redirectTo.pathname = '/auth/callback/error';

  return NextResponse.redirect(redirectTo);
}
