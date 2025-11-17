import { NextRequest, NextResponse } from 'next/server';



import { createAuthCallbackService } from '@kit/supabase/auth';
import { getSupabaseRouteHandlerClient } from '@kit/supabase/route-handler-client';



import pathsConfig from '~/config/paths.config';

// Force dynamic rendering to prevent static page data collection during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const service = createAuthCallbackService(getSupabaseRouteHandlerClient());

  const url = await service.verifyTokenHash(request, {
    joinTeamPath: pathsConfig.app.joinTeam,
    redirectPath: pathsConfig.app.home,
  });
  return NextResponse.redirect(url);
}