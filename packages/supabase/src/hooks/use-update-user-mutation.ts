import type { UserAttributes } from '@supabase/gotrue-js';

import { useMutation } from '@tanstack/react-query';

import { useSupabase } from './use-supabase';

type Params = UserAttributes & { redirectTo: string };

export function useUpdateUser() {
  const client = useSupabase();
  const mutationKey = ['supabase:user'];

  const mutationFn = async (attributes: Params) => {
    const { redirectTo, ...params } = attributes;

    const domain = (typeof window !== 'undefined' 
      ? window.location.origin.replace(/^https?:\/\//, '')
      : '');

    const { data: userData, error: userError} = await client.auth.getUser();

    if (userError) {
      throw userError;
    }

    const email = userData.user?.email;

    if (!email) {
      throw new Error('User email not found');
    }

    const responseUpdateUserCredentials = await client.rpc('update_user_credentials', {
      p_domain: domain,
      p_email: email,
      p_password: params.password ?? '',
    });

    if (responseUpdateUserCredentials.error) {
      throw responseUpdateUserCredentials.error;
    }

    const response = await client.auth.updateUser(params, {
      emailRedirectTo: redirectTo,
    });

    if (response.error) {
      throw response.error;
    }

    return response.data;
  };

  return useMutation({
    mutationKey,
    mutationFn,
  });
}
