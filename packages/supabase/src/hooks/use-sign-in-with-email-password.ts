import type { SignInWithPasswordCredentials } from '@supabase/supabase-js';
import { generateMagicLinkRecoveryPassword, verifyUserCredentials } from '../../../features/team-accounts/src/server/actions/members/update/update-account';
import { useMutation } from '@tanstack/react-query';

import { useSupabase } from './use-supabase';

export function useSignInWithEmailPassword() {
  const client = useSupabase();
  const mutationKey = ['auth', 'sign-in-with-email-password'];

  const mutationFn = async (credentials: SignInWithPasswordCredentials) => {
    // set session
    const domain = (typeof window !== 'undefined' 
      ? window.location.origin.replace(/^https?:\/\//, '')
      : '');

      if (!('email' in credentials)) {
        throw new Error('The email is required to sign in');
      }

    const responseVerifyUserCredentials = await verifyUserCredentials(domain, credentials.email, credentials.password);

    const isUserAllowed = responseVerifyUserCredentials.is_allowed;
    const isUserPrimary = responseVerifyUserCredentials.is_primary;

    if (!isUserAllowed) {
      throw new Error('User is not allowed to sign in');
    }

    let userId = '';
    let data = {};

    if (isUserPrimary) {

    const response = await client.auth.signInWithPassword(credentials);

    if (response.error) {
      throw response.error.message;
    }

    // Step 1: Get the user auhentication/logged in user 
    const user = response.data?.user;
    const identities = user?.identities ?? [];

    // if the user has no identities, it means that the email is taken
    if (identities.length === 0) {
      throw new Error('User already registered');
    }
    userId = user.id;
    data = response.data;
  } else {
    const location = await generateMagicLinkRecoveryPassword(credentials.email, undefined, true, true);

    if (!location) {
      throw new Error(`Error signing in with email and password`);
    }

    const hash = new URL(location).hash.substring(1);
    const query = new URLSearchParams(hash);
    const accessToken = query.get('access_token');
    const refreshToken = query.get('refresh_token');
    
    if (accessToken && refreshToken && !(await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })).error) {       
      const { data: userData } = await client.auth.getUser();
      userId = userData?.user?.id ?? '';
      data = userData;
    } else {
      throw new Error('Error signing in with email and password');
    }
  }

    const { error: setSessionError } = await client.rpc('set_session', {
      domain,
    });

    if (setSessionError) {
      throw setSessionError.message;
    }

    

    // Step 2: Get the organization id fetching the domain/subdomain data
    const organizationId = (await client.rpc('get_current_organization_id')).data ?? '';

    // Step 3: Get the client data (user_client_id) from db where the agency_id is the organization id of the domain/subdomain
    const { data: notAllowedClient, error: clientError } = await client
      .from('clients')
      .select('user_client_id')
      .eq('user_client_id', userId)
      .eq('agency_id', organizationId ?? '')
      .not('deleted_on', 'is', null)
      .maybeSingle();

    if (clientError) {
      throw new Error(`Error fetching client data: ${clientError.message}`);
    }

    const { data: notAllowedMember } = await client
    .from('accounts')
    .select('id')
    .eq('id', userId)
    .not('deleted_on', 'is', null)
    .maybeSingle();
    
    // Step 6: If the user is not allowed bcz is deleted from the agency's clients, don't allow the user to sign in
    if (notAllowedClient ?? notAllowedMember) {
      // Log the user out
      await client.auth.signOut();
      throw new Error('User cannot sign in with this account');
    } else {
    // Step 7: If the user is allowed, just proceed (return as normal)
      return data;
    }
  };

  return useMutation({ mutationKey, mutationFn });
}
