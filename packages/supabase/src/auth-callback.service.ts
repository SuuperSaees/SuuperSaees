import 'server-only';

import { type EmailOtpType, SupabaseClient } from '@supabase/supabase-js';

import { TokenRecoveryType, DefaultToken } from '../../tokens/src/domain/token-type';
import { verifyToken } from '../../tokens/src/verify-token';
// import { decodeToken } from '../../tokens/src/decode-token';
import { getSupabaseServerComponentClient } from './clients/server-component.client';
import { getDomainByUserId, getDomainByOrganizationId} from '../../multitenancy/utils/get/get-domain';
import { createClient } from '../../features/team-accounts/src/server/actions/clients/create/create-clients';

/**
 * @name createAuthCallbackService
 * @description Creates an instance of the AuthCallbackService
 * @param client
 */
export function createAuthCallbackService(client: SupabaseClient) {
  return new AuthCallbackService(client);
}

/**
 * @name AuthCallbackService
 * @description Service for handling auth callbacks in Supabase
 */
class AuthCallbackService {
  constructor(private readonly client: SupabaseClient) {}

  /**
   * @name verifyTokenHash
   * @description Verifies the token hash and type and redirects the user to the next page
   * This should be used when using a token hash to verify the user's email
   * @param request
   * @param params
   */
  async verifyTokenHash(
    request: Request,
    params: {
      joinTeamPath: string;
      redirectPath: string;
      errorPath?: string;
    },
  ): Promise<URL> {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const token_hash_session = searchParams.get('token_hash_session');
    const tokenHashRecovery = searchParams.get('token_hash_recovery');
    const publicTokenId = searchParams.get('public_token_id');
    const callbackNextPath = searchParams.get('next');
    const host = request.headers.get('host');
    const emailToInvite = searchParams.get('email');

    const adminClient = getSupabaseServerComponentClient({
          admin: true,
      });

    // set the host to the request host since outside of Vercel it gets set as "localhost"
    if (url.host.includes('localhost:') && !host?.includes('localhost')) {
      url.host = host as string;
      url.port = '';
    }

    url.pathname = params.redirectPath;

    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;
    const callbackParam = searchParams.get('callback');

    let nextPath: string | null = null;
    const callbackUrl = callbackParam ? new URL(callbackParam) : null;

    if (callbackUrl) {
      // if we have a next path in the callback url, we use that
      if (callbackNextPath) {
        nextPath = callbackNextPath;
      } else {
        nextPath = callbackUrl.pathname;
      }
    }

    const inviteToken = callbackUrl?.searchParams.get('invite_token');
    const errorPath = params.errorPath ?? '/auth/callback/error';

    // remove the query params from the url
    searchParams.delete('token_hash');
    searchParams.delete('token_hash_session');
    searchParams.delete('type');
    searchParams.delete('next');
    searchParams.delete('callback');
    searchParams.delete('public_token_id');

    // if we have a next path, we redirect to that path
    if (nextPath) {
      url.pathname = nextPath;
    }

    if (publicTokenId) {
      // get session from supabase
      const { data: session } = await this.client.auth.getSession();
      if (session?.session) {
        // redirect to the next path
        url.href = callbackNextPath?.split('?')[0] ?? url.href;
        const { domain } = await getDomainByUserId(session.session.user.id, true);
        if (domain) {
          url.href = `${domain}${url.pathname}`
        }
        return url;
      }

      // token can be expired. Because it's a public token, we don't need to verify the expiration date
      const { payload } = await verifyToken(
        '',
        publicTokenId,
      ) as { isValidToken: boolean; payload?: DefaultToken };

      if (payload) {
        
        const { data, error } = await adminClient
        .from('accounts')
        .select('count')
        .like('email', 'guest%@suuper.co')
        .single();

      if (error) {
        console.error('Error getting guest count', error);
        throw new Error('Error getting guest count');
      }
        url.href = callbackNextPath?.split('?')[0] ?? url.href;

        const count = (data?.count ?? 0) + 1;
        // here we need to set the session with the user data
        const response = await createClient({
          agencyId: payload.agency_id ?? '',
          adminActivated: true,
          client: {
            email: `guest+${count}@suuper.co`,
            name: 'guest ' + count,
            slug: `guest ${count}'s organization`,
          },
          role: 'client_guest',
          sendEmail: false,
        });

        if (response.ok) {
          const orderId = Number(callbackNextPath?.split('/')[4]?.split('?')[0]);
          const { access_token, refresh_token } = response.success?.data?.session;
          await this.client.auth.setSession({ access_token, refresh_token });
            const { error } = await this.client.from('order_followers')
            .insert({
              order_id: orderId,
              client_member_id: response.success?.data?.user_client_id,
            });
          const domain  = await getDomainByOrganizationId(response.success?.data?.agency_id ?? '', true, true);
          if (domain) {
            url.href = `${domain}${url.pathname}`
          }

          const onlyDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

          await this.client.rpc('set_session', {
            domain: onlyDomain,
          });
          if (error) {
            console.error('Error adding follower to order', error);
            throw new Error('Error adding follower to order');
          }
          return url;
        }
      }
    }

    if (tokenHashRecovery && type) {
      const { isValidToken, payload } = await verifyToken(
        '',
        tokenHashRecovery,
      ) as { isValidToken: boolean; payload?: TokenRecoveryType };
      
      if (!isValidToken) {
        console.error('Error verifying token hash session');
      }
      
      const newUrlPayload = new URL(payload?.redirectTo ?? '');

      let newCallbackNextPath = callbackNextPath;

      if (emailToInvite && !newCallbackNextPath?.includes('set-password') && !newCallbackNextPath?.includes('orders')) {
        newCallbackNextPath = `${newCallbackNextPath}&email=${emailToInvite}`;
      }

        

      // if type is update_email we use the rpc
      if (type === 'update_email' as EmailOtpType) {

        const { error } = await adminClient.rpc('update_email', {
          new_email: emailToInvite?.replace(' ', '+') ?? '',
          user_id: payload?.user_id ?? '',
          p_domain: payload?.domain ?? '',
        });

        if (error) {
          console.error('Error updating email', error);
        }
      }
      
      const response = await fetch(payload?.redirectTo ?? '', {
        method: 'GET',
        redirect: 'manual',
      });
  
      const location = response.headers.get('Location');
  
      if (!location) {
        throw new Error(`Error generating magic link. Location header not found`);
      }
  
      const hash = new URL(location).hash.substring(1);
      const query = new URLSearchParams(hash);
      const accessToken = query.get('access_token');
      const refreshToken = query.get('refresh_token');
      
      if (accessToken && refreshToken && !(await this.client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })).error) {       
        url.href = newCallbackNextPath ?? newUrlPayload.searchParams.get('redirect_to') ?? url.href;
        const fullUrl = url.href;
        const domainMatch = fullUrl.match(/^https?:\/\/([^\\/]+)/);
        const onlyDomain = payload?.domain ?? (domainMatch ? domainMatch[1] : '');

        await this.client.rpc('set_session', {
          domain: onlyDomain,
        });
        return url;
      } else {
        console.error('error setting session');
        url.href = newCallbackNextPath ?? newUrlPayload.searchParams.get('redirect_to') ?? url.href;
        return url;
      }
    }

    // if we have an invite token, we append it to the redirect url
    if (inviteToken) {
      // if we have an invite token, we redirect to the join team page
      // instead of the default next url. This is because the user is trying
      // to join a team and we want to make sure they are redirected to the
      // correct page.
      url.pathname = params.joinTeamPath;
      searchParams.set('invite_token', inviteToken);

      const emailParam = callbackUrl?.searchParams.get('email');

      if (emailParam) {
        searchParams.set('email', emailParam);
      }
    }

    if (token_hash && type) {
      const { error } = await this.client.auth.verifyOtp({
        type,
        token_hash,
      });

      if (!error) {
        return url;
      }
    }
    const supabaseServerComponentClient = getSupabaseServerComponentClient({
      admin: true,
    });
    if (token_hash_session) {
      // search in the database for the token_hash_session
      const query = supabaseServerComponentClient
      .from('tokens')
      .select('*')

      let accessToken: string | undefined;
      let refreshToken: string | undefined;

      if(token_hash_session.includes('suuper')){
        const { data, error } = await query.eq('id_token_provider', token_hash_session).single();
        if (error) {
          console.error('Error verifying token hash session', error);
        }
        accessToken = data?.access_token;
        refreshToken = data?.refresh_token;
      } else {
        const { data, error } = await query.eq('id', token_hash_session).single();
        if (error) {
          console.error('Error verifying token hash session', error);
        }
        accessToken = data?.access_token;
        refreshToken = data?.refresh_token;
      }

      
      if (accessToken && refreshToken) {
        // set session with the user data
        const { error } = await this.client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
        url.pathname = callbackParam ?? baseUrl;
        url.href = callbackParam ?? baseUrl;

        const fullUrl = url.href;
        const domainMatch = fullUrl.match(/^https?:\/\/([^\\/]+)/);
        const onlyDomain = domainMatch ? domainMatch[1] : '';

        await this.client.rpc('set_session', {
          domain: onlyDomain,
        });
        
        if (!error) {
          return url;
        }
      }
    }

    // return the user to an error page with some instructions
    url.pathname = errorPath;

    return url;
  }

  /**
   * @name exchangeCodeForSession
   * @description Exchanges the auth code for a session and redirects the user to the next page or an error page
   * @param request
   * @param params
   */
  async exchangeCodeForSession(
    request: Request,
    params: {
      joinTeamPath: string;
      redirectPath: string;
      errorPath?: string;
    },
  ): Promise<{
    nextPath: string;
  }> {
    const requestUrl = new URL(request.url);
    const searchParams = requestUrl.searchParams;

    const authCode = searchParams.get('code');
    const error = searchParams.get('error');
    const nextUrlPathFromParams = searchParams.get('next');
    const inviteToken = searchParams.get('invite_token');
    const emailParam = searchParams.get('email');
    const errorPath = params.errorPath ?? '/auth/callback/error';
    let nextUrl = nextUrlPathFromParams ?? params.redirectPath;

    // if we have an invite token, we redirect to the join team page
    // instead of the default next url. This is because the user is trying
    // to join a team and we want to make sure they are redirected to the
    // correct page.

    if (inviteToken) {
      const urlParams = new URLSearchParams({
        invite_token: inviteToken,
        email: emailParam ?? '',
      });

      nextUrl = `${params.joinTeamPath}?${urlParams.toString()}`;
    }

    if (authCode) {
      try {
        const { error } =
          await this.client.auth.exchangeCodeForSession(authCode);

        // if we have an error, we redirect to the error page
        if (error) {
          return onError({
            error: error.message,
            path: errorPath,
          });
        }
      } catch (error) {
        console.error(
          {
            error,
            name: `auth.callback`,
          },
          `An error occurred while exchanging code for session`,
        );

        const message = error instanceof Error ? error.message : error;

        return onError({
          error: message as string,
          path: errorPath,
        });
      }
    }


    if (error) {
      return onError({
        error,
        path: errorPath,
      });
    }

    return {
      nextPath: nextUrl,
    };
  }
}

function onError({ error, path }: { error: string; path: string }) {
  const errorMessage = getAuthErrorMessage(error);

  console.error(
    {
      error,
      name: `auth.callback`,
    },
    `An error occurred while signing user in`,
  );

  const nextPath = `${path}?error=${errorMessage}`;

  return {
    nextPath,
  };
}

/**
 * Checks if the given error message indicates a verifier error.
 * We check for this specific error because it's highly likely that the
 * user is trying to sign in using a different browser than the one they
 * used to request the sign in link. This is a common mistake, so we
 * want to provide a helpful error message.
 */
function isVerifierError(error: string) {
  return error.includes('both auth code and code verifier should be non-empty');
}

function getAuthErrorMessage(error: string) {
  return isVerifierError(error)
    ? `auth:errors.codeVerifierMismatch`
    : `auth:authenticationErrorAlertBody`;
}

// function to log out the user before starting the new session:
// async function logOutUser(supabase: SupabaseClient) {
//   const { error } = await supabase.auth.signOut();

//   if (error) {
//     console.error('Error logging out user', error);
//   }
// }