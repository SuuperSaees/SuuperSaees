import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import { URLPattern } from 'next/server';

import pathsConfig from '~/config/paths.config';

// import { createMiddlewareClient } from '@kit/supabase/middleware-client';
// import { checkRequiresMultiFactorAuthentication } from '@kit/supabase/check-requires-mfa';

export function getPatterns() {
  return [
    {
      pattern: new URLPattern({ pathname: '/' }),
      handler: (req: NextRequest) => {
        return NextResponse.redirect(
          new URL(pathsConfig.app.home, req.nextUrl.origin).href,
        );
      },
    },
    // {
    //   pattern: new URLPattern({ pathname: '/admin/*?' }),
    //   handler: adminMiddleware,
    // },
    // {
    //   pattern: new URLPattern({ pathname: '/auth/*?' }),
    //   handler: authMiddleware,
    // },
    // {
    //   pattern: new URLPattern({ pathname: '/home/*?' }),
    //   handler: homeMiddleware,
    // },
    // {
    //   pattern: new URLPattern({ pathname: '/api/v1' }),
    // },
  ];
}

// async function adminMiddleware(request: NextRequest, response: NextResponse) {
// }

// async function authMiddleware(request: NextRequest, response: NextResponse) {
// }

// async function homeMiddleware(request: NextRequest, response: NextResponse) {
// }

export function matchUrlPattern(url: string) {
  const patterns = getPatterns();
  const input = url.split('?')[0];
  for (const pattern of patterns) {
    const patternResult = pattern.pattern.exec(input);
    if (patternResult !== null && 'pathname' in patternResult) {
      return pattern.handler;
    }
  }
}
