import type { NextRequest } from 'next/server';
import { NextResponse, URLPattern } from 'next/server';



import { CsrfError, createCsrfProtect } from '@edge-csrf/nextjs';



import { checkRequiresMultiFactorAuthentication } from '@kit/supabase/check-requires-mfa';
import { createMiddlewareClient } from '@kit/supabase/middleware-client';



import appConfig from '~/config/app.config';
import pathsConfig from '~/config/paths.config';

const CSRF_SECRET_COOKIE = 'csrfSecret';
const NEXT_ACTION_HEADER = 'next-action';

const CLIENT_ID = 'dev_b9806c46-8348-4347-a639-7ac223f17546suuper.co';
const CLIENT_SECRET =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjkwMjk0ZmM2LWJlODItNGE5Zi04ZDIyLTNjZDc0ZDAwODJjZSIsIm5hbWUiOiJzYW11ZWwiLCJlbWFpbCI6InNhbXVlbEBzdXVwZXIuY28iLCJkb21haW4iOiJzdXVwZXIuY28ifQ.Q3rEzb3evSkVZgJeIYtJtRn_5f2xUG1HHxRnVoACDV0';

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|images|locales|assets|api).*)',
    '/api/v1/:path*',
  ],
};

// function to verify the basic auth credentials to api use.
function isValidBasicAuth(request: NextRequest): boolean {
  const authorizationHeader = request.headers.get('authorization');

  if (!authorizationHeader?.startsWith('Basic ')) {
    return false;
  }

  const base64Credentials = authorizationHeader.split(' ')[1];
  const credentials = atob(base64Credentials!).split(':');

  const clientId = credentials[0];
  const clientSecret = credentials[1];

  return clientId === CLIENT_ID && clientSecret === CLIENT_SECRET;
}

const getUser = (request: NextRequest, response: NextResponse) => {
  const supabase = createMiddlewareClient(request, response);

  return supabase.auth.getUser();
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  // Verify route /api/v1
  if (request.nextUrl.pathname.startsWith('/api/v1')) {
    // Verify route authentication
    if (!isValidBasicAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  const IS_PROD = process.env.NEXT_PUBLIC_IS_PROD === 'true';

  // ignore if request path has auth

  const ignorePath = new Set(['auth', 'add-organization', 'api', 'home']);

  const shouldIgnorePath = (pathname: string) => {
    return Array.from(ignorePath).some((path) => pathname.includes(path));
  };

  const ignoreRole = new Set(['client_owner', 'client_member']);

  if (IS_PROD && !shouldIgnorePath(request.nextUrl.pathname)) {
    try {
      const supabase = createMiddlewareClient(request, response);
      const userData = await getUser(request, response);
      const userId = userData.data?.user?.id ?? '';
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('organization_id, accounts_memberships(account_role)')
        .eq('id', userId)
        .single();

      if (accountError) {
        throw new Error(`Unauthorized: ${accountError?.message}`);
      }
      if (
        accountData?.accounts_memberships?.some((membership) =>
          ignoreRole.has(membership.account_role),
        )
      ) {
        const { data: domainsData, error: domainsError } = await supabase
          .from('organization_subdomains')
          .select('subdomains(domain)')
          .eq('organization_id', accountData?.organization_id ?? '')
          .single();

        if (domainsError) {
          throw new Error(`Error fetching domains: ${domainsError.message}`);
        }

        const origin = request.nextUrl.origin;

        const originDomain = new URL(origin).host;
        if (originDomain === domainsData?.subdomains?.domain) {
          response.headers.set('Access-Control-Allow-Origin', origin);
        } else {
          throw new Error('Unauthorized: Invalid Origin');
        }
        // Allow cors for all requests
        if (request.method === 'OPTIONS') {
          return new Response(null, {
            headers: {
              'Access-Control-Allow-Origin':
                origin === `https://${domainsData?.subdomains?.domain}`
                  ? origin
                  : '',
              'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          });
        }

        response.headers.set(
          'Access-Control-Allow-Methods',
          'GET, POST, DELETE, OPTIONS',
        );
        response.headers.set(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization',
        );
      }
    } catch (error) {
      console.error('Error in middleware', error);
      // redirect to landing page
      // sign out user
      // const landing_page = `${process.env.NEXT_PUBLIC_SITE_URL}auth/sign-in`;
      const supabase = createMiddlewareClient(request, response);
      await supabase.auth.signOut();
      // return NextResponse.redirect(new URL(landing_page, request.nextUrl.origin).href);
    }
  }
  // set current path
  response.headers.set('x-current-path', request.nextUrl.pathname);

  // set a unique request ID for each request
  // this helps us log and trace requests
  setRequestId(request);

  // apply CSRF protection for mutating requests
  const csrfResponse = await withCsrfMiddleware(request, response);

  // handle patterns for specific routes
  const handlePattern = matchUrlPattern(request.url);

  // if a pattern handler exists, call it
  if (handlePattern) {
    const patternHandlerResponse = await handlePattern(request, csrfResponse);

    // if a pattern handler returns a response, return it
    if (patternHandlerResponse) {
      return patternHandlerResponse;
    }
  }

  // append the action path to the request headers
  // which is useful for knowing the action path in server actions
  if (isServerAction(request)) {
    csrfResponse.headers.set('x-action-path', request.nextUrl.pathname);
  }

  // if no pattern handler returned a response,
  // return the session response
  return csrfResponse;
}

async function withCsrfMiddleware(
  request: NextRequest,
  response = new NextResponse(),
) {
  // set up CSRF protection
  const csrfProtect = createCsrfProtect({
    cookie: {
      secure: appConfig.production,
      name: CSRF_SECRET_COOKIE,
    },
    // ignore CSRF errors for server actions since protection is built-in
    ignoreMethods: isServerAction(request)
      ? ['POST']
      : // always ignore GET, HEAD, and OPTIONS requests
        ['GET', 'HEAD', 'OPTIONS'],
  });

  try {
    await csrfProtect(request, response);

    return response;
  } catch (error) {
    // if there is a CSRF error, return a 403 response
    if (error instanceof CsrfError) {
      return NextResponse.json('Invalid CSRF token', {
        status: 401,
      });
    }

    throw error;
  }
}

function isServerAction(request: NextRequest) {
  const headers = new Headers(request.headers);

  return headers.has(NEXT_ACTION_HEADER);
}

async function adminMiddleware(request: NextRequest, response: NextResponse) {
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');

  if (!isAdminPath) {
    return response;
  }

  const {
    data: { user },
    error,
  } = await getUser(request, response);

  // If user is not logged in, redirect to sign in page.
  // This should never happen, but just in case.
  if (!user || error) {
    return NextResponse.redirect(
      new URL(pathsConfig.auth.signIn, request.nextUrl.origin).href,
    );
  }

  const role = user?.app_metadata.role;

  // If user is not an admin, redirect to 404 page.
  if (!role || role !== 'super-admin') {
    return NextResponse.redirect(new URL('/404', request.nextUrl.origin).href);
  }

  // in all other cases, return the response
  return response;
}

/**
 * Define URL patterns and their corresponding handlers.
 */
function getPatterns() {
  return [
    {
      // partially removing accesss to '/', since landing page is on construction.
      pattern: new URLPattern({ pathname: '/' }),
      handler: (req: NextRequest) => {
        return NextResponse.redirect(
          new URL(pathsConfig.app.home, req.nextUrl.origin).href,
        );
      },
    },
    {
      pattern: new URLPattern({ pathname: '/admin/*?' }),
      handler: adminMiddleware,
    },
    {
      pattern: new URLPattern({ pathname: '/auth/*?' }),
      handler: async (req: NextRequest, res: NextResponse) => {
        const {
          data: { user },
        } = await getUser(req, res);

        // the user is logged out, so we don't need to do anything
        if (!user) {
          return;
        }

        // check if we need to verify MFA (user is authenticated but needs to verify MFA)
        const isVerifyMfa = req.nextUrl.pathname === pathsConfig.auth.verifyMfa;

        // If user is logged in and does not need to verify MFA,
        // redirect to home page.
        if (!isVerifyMfa) {
          return NextResponse.redirect(
            new URL(pathsConfig.app.home, req.nextUrl.origin).href,
          );
        }
      },
    },
    {
      pattern: new URLPattern({ pathname: '/home/*?' }),
      handler: async (req: NextRequest, res: NextResponse) => {
        const {
          data: { user },
        } = await getUser(req, res);

        const origin = req.nextUrl.origin;
        const next = req.nextUrl.pathname;

        // If user is not logged in, redirect to sign in page.
        if (!user) {
          const signIn = pathsConfig.auth.signIn;
          const redirectPath = `${signIn}?next=${next}`;
          // const signUp = pathsConfig.auth.signUp;
          // const redirectPath = `${signUp}?next=${next}`;

          return NextResponse.redirect(new URL(redirectPath, origin).href);
        }

        const supabase = createMiddlewareClient(req, res);

        const requiresMultiFactorAuthentication =
          await checkRequiresMultiFactorAuthentication(supabase);

        // If user requires multi-factor authentication, redirect to MFA page.
        if (requiresMultiFactorAuthentication) {
          return NextResponse.redirect(
            new URL(pathsConfig.auth.verifyMfa, origin).href,
          );
        }
      },
    },
    {
      pattern: new URLPattern({ pathname: '/api/v1' }),
    },
  ];
}

/**
 * Match URL patterns to specific handlers.
 * @param url
 */
function matchUrlPattern(url: string) {
  const patterns = getPatterns();
  const input = url.split('?')[0];
  for (const pattern of patterns) {
    const patternResult = pattern.pattern.exec(input);

    if (patternResult !== null && 'pathname' in patternResult) {
      return pattern.handler;
    }
  }
}

/**
 * Set a unique request ID for each request.
 * @param request
 */
function setRequestId(request: Request) {
  request.headers.set('x-correlation-id', crypto.randomUUID());
}