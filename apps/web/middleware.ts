import type { NextRequest } from 'next/server';
import { NextResponse, URLPattern } from 'next/server';



import { checkRequiresMultiFactorAuthentication } from '@kit/supabase/check-requires-mfa';
import { createMiddlewareClient } from '@kit/supabase/middleware-client';



import pathsConfig from '~/config/paths.config';
import { getDomainByUserId } from '~/multitenancy/utils/get/get-domain';
import { fetchDeletedClients } from '~/team-accounts/src/server/actions/clients/get/get-clients';
import { getOrganizationByUserId } from '~/team-accounts/src/server/actions/organizations/get/get-organizations';



import { handleApiAuth } from './handlers/api-auth-handler';
import { handleCors } from './handlers/cors-handler';
import { handleCsrf } from './handlers/csrf-handler';

// import { handleDomainCheck } from './handlers/domain-check-handler';

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|images|locales|assets|api/v1/webhook|api).*)',
    '/api/v1/:path*',
  ],
};

function getCachedDomain(request: NextRequest, userId: string): string | null {
  const domainCookie = request.cookies.get(`domain_${userId}`);
  return domainCookie ? domainCookie.value : null;
}

function setCachedDomain(
  response: NextResponse,
  userId: string,
  domain: string,
  isProd: boolean,
) {
  // Cache the domain for 1 hour (you can adjust this time as needed)
  response.cookies.set(`domain_${userId}`, domain, {
    maxAge: 60 * 60,
    secure: isProd,
  });
}

const getUser = (request: NextRequest, response: NextResponse) => {
  const supabase = createMiddlewareClient(request, response);

  return supabase.auth.getUser();
};

export async function middleware(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return handleCORSPreflight();
  }
  const response = NextResponse.next();

  // API Authentication
  const apiAuthResult = handleApiAuth(request);
  if (apiAuthResult) return apiAuthResult;

  // Domain Check
  // const domainCheckResult = await handleDomainCheck(request, response);
  // if (domainCheckResult) return domainCheckResult;

  const IS_PROD = process.env.NEXT_PUBLIC_IS_PROD === 'true';
  const ignorePath = new Set([
    'auth',
    '/auth/confirm',
    'user-data',
    'add-organization',
    'api',
    'join',
    'join?invite_token=',
    '/join?invite_token=',
    '/join',
    'home',
    'checkout',
    'buy-success',
    '/__nextjs_original-stack-frame',
  ]);
  const shouldIgnorePath = (pathname: string) =>
    Array.from(ignorePath).some((path) => pathname.includes(path));

  if (
    IS_PROD &&
    !shouldIgnorePath(request.nextUrl.pathname) &&
    new URL(request.nextUrl.origin).host !== process.env.HOST_C4C7US
  ) {
    try {
      const supabase = createMiddlewareClient(request, response);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id ?? '';
      // Try to get the domain from cache (cookie)
      let domain = getCachedDomain(request, userId) ?? '';

      if (!domain) {
        // If not in cache, fetch the domain
        try {
          const { domain: domainByUserId } = await getDomainByUserId(
            userId,
            false,
          );
          domain = domainByUserId;
        } catch (error) {
          console.error('Error in middleware', error);
        }
        // Cache the domain in a cookie
        setCachedDomain(response, userId, domain, IS_PROD);
      }

      const corsResult = handleCors(request, response, domain);
      if (corsResult) return corsResult;

      if (new URL(request.nextUrl.origin).host !== domain) {
        throw new Error('Unauthorized: Invalid Origin');
      }
    } catch (error) {
      console.error('Error in middleware', error);
      const landingPage = `${process.env.NEXT_PUBLIC_SITE_URL}auth/sign-in`;
      const supabase = createMiddlewareClient(request, response);
      await supabase.auth.signOut();
      return NextResponse.redirect(
        new URL(landingPage, request.nextUrl.origin).href,
      );
    }
  }

  response.headers.set('x-current-path', request.nextUrl.pathname);
  setRequestId(request);

  const csrfResponse = await handleCsrf(request, response);

  const handlePattern = matchUrlPattern(request.url);
  if (handlePattern) {
    const patternHandlerResponse = await handlePattern(request, csrfResponse);
    if (patternHandlerResponse) return patternHandlerResponse;
  }

  if (request.headers.has('next-action')) {
    csrfResponse.headers.set('x-action-path', request.nextUrl.pathname);
  }

  setCORSHeaders(csrfResponse);

  return csrfResponse;
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
      pattern: new URLPattern({ pathname: '/add-organization' }),
      handler: async (req: NextRequest, res: NextResponse) => {
        const {
          data: { user },
        } = await getUser(req, res);
        if (!user) {
          return;
        }

        const {id: organizationId} = await getOrganizationByUserId(
          user.id,
          true,
        ).catch((error) => {
          console.error('Error fetching organization from middleware:', error);
          return {
            id: '',
          };
        });
        if (organizationId) {
          return NextResponse.redirect(
            new URL(pathsConfig.app.orders, req.url).href,
          );
        }
        return;
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

        // Check URL parameters
        const searchParams = req.nextUrl.searchParams;
        const hasInviteToken = searchParams.has('invite_token');
        const hasEmail = searchParams.has('email');

        if (hasInviteToken && hasEmail) {
          return;
        }

        // Check if this request is for the activation link (e.g., /auth/confirm)
        const isActivationLink =
          req.nextUrl.pathname.startsWith('/auth/confirm');

        // Check if we need to verify MFA (user is authenticated but needs to verify MFA)
        const isVerifyMfa = req.nextUrl.pathname === pathsConfig.auth.verifyMfa;

        // If it's an activation link, do not redirect to home, continue with the request
        if (isActivationLink) {
          return; // Allow the process to continue for the activation flow => auth-callback.service.ts
        }
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
    {
      // Verify if the client is eliminated from the agency
      pattern: new URLPattern({ pathname: '/*' }),
      handler: async (req: NextRequest, res: NextResponse) => {
        const supabase = createMiddlewareClient(req, res);
        const {
          data: { user },
        } = await getUser(req, res);
        if (req.nextUrl.pathname === '/add-organization') {
          return;
        }
        // the user is logged out, so we don't need to do anything
        if (!user) {
          return;
        }
        const userId = user.id;

        // Step 2: Get the organization id fetching the domain/subdomain data
        const { organizationId } = await getDomainByUserId(userId, true);

        // Step 3: Get the client data (user_client_id) from db where the agency_id is the organization id of the domain/subdomain
        const clientDeleted = await fetchDeletedClients(
          supabase,
          organizationId,
          userId,
        ).catch((error) =>
          console.error('Error fetching deleted from middleware:', error),
        );

        // Step 4: If the client is deleted, sign out the user
        if (clientDeleted) {
          await supabase.auth.signOut();
          return NextResponse.redirect(
            new URL(pathsConfig.auth.signIn, req.url).href,
          );
        }
        return;
      },
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

function handleCORSPreflight() {
  const response = new NextResponse(null, { status: 204 });
  setCORSHeaders(response);
  return response;
}

function setCORSHeaders(response: NextResponse) {
  response.headers.append('Access-Control-Allow-Credentials', 'true');
  response.headers.append('Access-Control-Allow-Origin', '*'); // replace this your actual origin
  response.headers.append(
    'Access-Control-Allow-Methods',
    'GET,DELETE,PATCH,POST,PUT',
  );
  response.headers.append(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  );
}