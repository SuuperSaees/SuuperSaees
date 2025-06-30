import type { NextRequest } from 'next/server';
import { NextResponse, URLPattern } from 'next/server';

import { createMiddlewareClient } from '@kit/supabase/middleware-client';

import pathsConfig from '~/config/paths.config';
import {
  getFullDomainBySubdomain,
} from '~/multitenancy/utils/get/get-domain';

import { handleApiAuth } from './handlers/api-auth-handler';
// import { handleCors } from './handlers/cors-handler';

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|images|locales|assets|api/v1/webhook|api).*)',
    '/api/v1/:path*',
  ],
};

/**
 * Define path access restrictions based on user roles
 * Each entry specifies which roles are allowed to access specific paths
 */
const PATH_ROLE_RESTRICTIONS = [
  {
    path: '/briefs',
    allowedRoles: ['agency_project_manager', 'agency_owner'],
    redirectTo: '/orders', // Where to redirect if access is denied
  },
  {
    path: '/clients',
    allowedRoles: ['agency_owner', 'agency_project_manager', 'agency_member'],
    redirectTo: '/orders',
  },
  {
    path: '/team',
    allowedRoles: ['agency_owner', 'agency_project_manager', 'agency_member'],
    redirectTo: '/orders',
  },
  {
    path: '/services',
    allowedRoles: ['agency_owner', 'agency_project_manager'],
    redirectTo: '/orders',
  },
  {
    path: '/invoices',
    allowedRoles: ['agency_owner', 'agency_project_manager', 'client_owner', 'client_member'],
    redirectTo: '/orders',
  },

] as const;

/**
 * Check if a user role has access to a specific path
 * @param userRole - The current user's role
 * @param pathname - The path being accessed
 * @returns Object with access status and redirect URL if denied
 */
function checkRoleAccess(userRole: string, pathname: string): 
  | { hasAccess: true; redirectTo: null }
  | { hasAccess: false; redirectTo: string } {
  for (const restriction of PATH_ROLE_RESTRICTIONS) {
    // Check if the current path matches the restricted path
    if (pathname.startsWith(restriction.path)) {
      // Check if the user's role is in the allowed roles list
      const hasAccess = (restriction.allowedRoles as readonly string[]).includes(userRole);
      
      if (!hasAccess) {
        return {
          hasAccess: false,
          redirectTo: restriction.redirectTo,
        };
      }
    }
  }
  
  return {
    hasAccess: true,
    redirectTo: null,
  };
}

function getCachedLanguage(request: NextRequest): string | null {
  const langCookie = request.cookies.get('lang');
  return langCookie ? langCookie.value : null;
}

function setCachedLanguage(
  response: NextResponse,
  language: string
) {
  // Set the language cookie for i18next to use
  response.cookies.set('lang', language, {
    maxAge: 60 * 60 * 24, // 1 day - shorter expiry to ensure updates are picked up
  });
}

const getUser = async (request: NextRequest, response: NextResponse) => {
  const supabase = createMiddlewareClient(request, response);

  return await supabase.auth.getUser();
};

export async function middleware(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return handleCORSPreflight();
  }
  const response = NextResponse.next();

  // API Authentication
  const apiAuthResult = await handleApiAuth(request);
  
  if (apiAuthResult) {
    // If apiAuthResult is a response, transfer the custom headers
    if (apiAuthResult.headers) {
      apiAuthResult.headers.forEach((value, key) => {
        if (key.startsWith('x-suuper-')) {
          // Extract the original header name without the prefix
          const originalKey = key.replace('x-suuper-', '');
          // Set the header in the request for later use
          request.headers.set(originalKey, value);
          // Also set it in the response for debugging if needed
          response.headers.set(originalKey, value);
          apiAuthResult.headers.set(originalKey, value);
        }
      });
    }
    return apiAuthResult;
  }

  response.headers.set('x-current-path', request.nextUrl.pathname);
  setRequestId(request);

  const csrfResponse = response;

  const handlePattern = matchUrlPattern(request.url);
  if (handlePattern) {
    const patternHandlerResponse = await handlePattern(request, csrfResponse);
    if (patternHandlerResponse) return patternHandlerResponse;
  }

  if (request.headers.has('next-action')) {
    csrfResponse.headers.set('x-action-path', request.nextUrl.pathname);
  }

  setCORSHeaders(csrfResponse);

  try {
    const supabase = createMiddlewareClient(request, response);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let domain = '';

    for (const [key, cookie] of request.cookies) {
      if (key.startsWith('authDetails')) {
        domain = cookie.name.split('_')[1] ?? '';
      }
    }
    if (user) {
      // Always check for the latest language preferences on each request
      // This ensures changes to organization settings are immediately reflected
      
      // Check if the user has a language preference
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('preferences')
        .eq('user_id', user.id)
        .single();
      
      // Extract user language preference if it exists
      let language = 'en';
      
      if (userSettings?.preferences && 
          typeof userSettings.preferences === 'object' && 
          userSettings.preferences !== null && 
          'user' in userSettings.preferences && 
          typeof userSettings.preferences.user === 'object' && 
          userSettings.preferences.user !== null && 
          'language' in userSettings.preferences.user) {
        // User has a language preference, use it
        language = String(userSettings.preferences.user.language);
      } else {
        // If no user preference, fall back to organization setting
        const currentLanguage = request.cookies.get('lang')?.value;
        if (currentLanguage) {
          language = currentLanguage;
        } else {
          const domainData = await getFullDomainBySubdomain(domain, true, ['language']);
          language = domainData?.settings?.find(
            (setting) => setting.key === 'language'
          )?.value ?? 'en';
        }
      }

      // Get current language from cookie
      const currentLang = getCachedLanguage(request);
      
      // Only update cookie if the language has changed or cookie is missing
      if (!currentLang || currentLang !== language) {
        setCachedLanguage(csrfResponse, language);
      }

      let userRoleWithId = request.cookies.get('user_role')?.value;
      if (!userRoleWithId || `${userRoleWithId.split('-')[0]}-${user.id}` !== userRoleWithId) {
        const { data: currentUserRole } = await supabase.rpc('get_current_role');
        userRoleWithId = currentUserRole ?? '';
        csrfResponse.cookies.set('user_role', `${currentUserRole}-${user.id}`, {
          maxAge: 60 * 60 * 24, // 1 día
        });
      }
    } else {
      // Clear all localStorage when no session is present
      csrfResponse.headers.set('Clear-Site-Data', '"storage"');
      // Borrar cookie user_role si no hay usuario
      csrfResponse.cookies.set('user_role', '', { maxAge: 0 });
    }
  } catch (error) {
    console.error('Error setting language in middleware:', error);
  }

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
    return NextResponse.redirect(new URL('/orders', request.nextUrl.origin).href);
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
          new URL(pathsConfig.app.orders, req.nextUrl.origin).href,
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

        // If the user is not logged in and the request is for the onboarding page, redirect to the sign-up page
        if (!user && req.nextUrl.pathname === '/auth/onboarding') {
          return NextResponse.redirect(
            new URL(pathsConfig.auth.signUp, req.nextUrl.origin).href,
          );
        }

        // the user is logged out, so we don't need to do anything
        if (!user) {
          return;
        }

        // Check URL parameters
        const searchParams = req.nextUrl.searchParams;
        const hasInviteToken = searchParams.has('invite_token');
        const hasEmail = searchParams.has('email');
        const hasTokenHashSession = searchParams.has('token_hash_session');

        if (hasInviteToken && hasEmail) {
          return;
        }

        if (hasTokenHashSession && hasEmail) {
          return;
        }

        // Check if this request is for the activation link (e.g., /auth/confirm)
        const isActivationLink =
          req.nextUrl.pathname.startsWith('/auth/confirm');
        const isOnboarding =
          req.nextUrl.pathname.startsWith('/auth/onboarding');

        // Check if we need to verify MFA (user is authenticated but needs to verify MFA)
        const isVerifyMfa = req.nextUrl.pathname === pathsConfig.auth.verifyMfa;

        // If it's an activation link, do not redirect to home, continue with the request
        if (isActivationLink || isOnboarding) {
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
      pattern: new URLPattern({ pathname: '/success/*?' }),
      handler: () => {
        return NextResponse.next();
      },
    },
    {
      pattern: new URLPattern({ pathname: '/cancel/*?' }),
      handler: () => {
        return NextResponse.next();
      },
    },
    {
      pattern: new URLPattern({ pathname: '/*?' }),
      handler: async (req: NextRequest, res: NextResponse) => {
        const {
          data: { user },
        } = await getUser(req, res);

        const origin = req.nextUrl.origin;
        const next = req.nextUrl.pathname;

        const isOrdersPath =
          req.nextUrl.pathname.includes('orders') &&
          req.nextUrl.searchParams.has('public_token_id');

        // Check if this is an invitation URL
        const isInvitationUrl =
          req.nextUrl.pathname === '/join' &&
          req.nextUrl.searchParams.has('invite_token');

        // Check if this is a checkout URL
        const isCheckoutUrl =
          req.nextUrl.pathname === '/checkout' &&
          (req.nextUrl.searchParams.has('tokenId') ||
            req.nextUrl.searchParams.has('token_id'));

        // Skip authentication check for invitation URLs

        if (isOrdersPath) {
          const publicTokenId = req.nextUrl.searchParams.get('public_token_id');
          const originalPath = req.nextUrl.href;
          const confirmPath = `/auth/confirm?next=${originalPath}&public_token_id=${publicTokenId}`;
          return NextResponse.redirect(new URL(confirmPath, origin).href);
        }

        if (isInvitationUrl || isCheckoutUrl) {
          return;
        }
        // If user is not logged in, redirect to sign in page.
        if (!user) {
          const signIn = pathsConfig.auth.signIn;
          const redirectPath = `${signIn}?next=${next}`;
          return NextResponse.redirect(new URL(redirectPath, origin).href);
        }

        // check if the user has deleted_on in the metadata
        let domain = '';

        for (const [key, cookie] of req.cookies) {
          if (key.startsWith('authDetails')) {
            domain = cookie.name.split('_')[1] ?? '';
          }
        }

        const userMetadata = user.app_metadata;
        const hasDeletedOn = userMetadata?.[domain]?.deleted_on;
        const supabase = createMiddlewareClient(req, res);
        if (hasDeletedOn) {
          await supabase.auth.signOut();
          return NextResponse.redirect(new URL(pathsConfig.auth.signIn, origin).href);
        }

        let userRoleWithId = req.cookies.get('user_role')?.value;

        if (!userRoleWithId || `${userRoleWithId.split('-')[0]}-${user.id}` !== userRoleWithId) {
          const { data: currentUserRole } = await supabase.rpc('get_current_role');
          userRoleWithId = `${currentUserRole}-${user.id}`;
          res.cookies.set('user_role', userRoleWithId, {
            maxAge: 60 * 60 * 24, // 1 day
          });
        }
        const userRole = userRoleWithId.split('-')[0];

        // Check role-based path access restrictions (only if userRole exists)
        if (userRole) {
          const roleAccess = checkRoleAccess(userRole, req.nextUrl.pathname);
          if (!roleAccess.hasAccess) {
            return NextResponse.redirect(
              new URL(roleAccess.redirectTo, origin).href,
            );
          }
        }

        if (userRole === 'client_guest') {
          const allowedPaths = ['/orders', '/auth'];
          const currentPath = req.nextUrl.pathname;
          if (
            !currentPath.startsWith('/orders') &&
            !allowedPaths.some((path) => currentPath.startsWith(path))
          ) {
            return NextResponse.redirect(
              new URL(pathsConfig.app.orders, origin).href,
            );
          }
        }
 
        if (userRole === 'agency_owner') {
          const hasPhoneNumber = user.phone;
          if (
            !hasPhoneNumber &&
            !req.nextUrl.pathname.includes('auth/onboarding')
          ) {
            return NextResponse.redirect(
              new URL('/auth/onboarding', origin).href,
            );
          }
        }
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
    'X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
    // X-CSRF-Token, // put it back later
  );
}