import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';

import { getLogger } from '@kit/shared/logger';
import { getSupabaseRouteHandlerClient } from '@kit/supabase/route-handler-client';

import pathsConfig from '~/config/paths.config';

const defaultNextUrl = pathsConfig.app.home;

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const searchParams = requestUrl.searchParams;

  const authCode = searchParams.get('code');
  const error = searchParams.get('error');
  const nextUrlPathFromParams = searchParams.get('next');
  const inviteToken = searchParams.get('invite_token');

  let nextUrl = nextUrlPathFromParams ?? defaultNextUrl;

  // if we have an invite token, we redirect to the join team page
  // instead of the default next url. This is because the user is trying
  // to join a team and we want to make sure they are redirected to the
  // correct page.
  if (inviteToken) {
    nextUrl = `${pathsConfig.app.joinTeam}?invite_token=${inviteToken}`;
  }

  if (authCode) {
    const client = getSupabaseRouteHandlerClient();

    try {
      const { error } = await client.auth.exchangeCodeForSession(authCode);

      // if we have an error, we redirect to the error page
      if (error) {
        return onError({ error: error.message });
      }
    } catch (error) {
      const logger = await getLogger();

      logger.error(
        {
          error,
          name: `auth.callback`,
        },
        `An error occurred while exchanging code for session`,
      );

      const message = error instanceof Error ? error.message : error;

      return onError({ error: message as string });
    }
  }

  if (error) {
    return onError({ error });
  }

  return redirect(nextUrl);
}

async function onError({ error }: { error: string }) {
  const errorMessage = getAuthErrorMessage(error);
  const logger = await getLogger();

  logger.error(
    {
      error,
      name: `auth.callback`,
    },
    `An error occurred while signing user in`,
  );

  const redirectUrl = `/auth/callback/error?error=${errorMessage}`;

  return redirect(redirectUrl);
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
