import type { SignInWithPasswordCredentials } from '@supabase/supabase-js';

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

    console.log('domain', domain);

    const response = await client.auth.signInWithPassword(credentials);

    if (response.error) {
      throw response.error.message;
    }

    const { error: setSessionError } = await client.rpc('set_session', {
      domain,
    });

    if (setSessionError) {
      throw setSessionError.message;
    }

    // Step 1: Get the user auhentication/logged in user 
    const user = response.data?.user;
    const identities = user?.identities ?? [];

    // if the user has no identities, it means that the email is taken
    if (identities.length === 0) {
      throw new Error('User already registered');
    }
    const userId = user.id;

    // Step 2: Get the organization id fetching the domain/subdomain data
    const organizationId = (await client.rpc('get_session')).data?.organization?.id ?? '';

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
      return response.data;
    }
  };

  return useMutation({ mutationKey, mutationFn });
}
