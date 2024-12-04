import { useCallback } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

export function usePersonalAccountData(
  userId: string,
  partialAccount?:
    | {
        id: string | null;
        name: string | null;
        picture_url: string | null;
        stripe_id: string | null;
        settings: { picture_url: string | null } | null;
      }
    | undefined,
) {
  const client = useSupabase();
  // const queryKey = ['account:data', userId];
  // const queryFn = async () => {
  //   if (!userId) {
  //     return null;
  //   }

  //   const response = await client
  //     .from('accounts')
  //     .select(`id, name, picture_url, stripe_id, settings:user_settings(picture_url)`)
  //     .eq('primary_owner_user_id', userId)
  //     .eq('is_personal_account', true)
  //     .single();

  //   if (response.error) {
  //     throw response.error;
  //   }

  //   return response.data;
  // };

  // return useQuery({
  //   queryKey,
  //   queryFn,
  //   enabled: !!userId,
  //   refetchOnWindowFocus: false,
  //   refetchOnMount: false,
  //   initialData: partialAccount?.id
  //     ? {
  //         id: partialAccount.id,
  //         name: partialAccount.name,
  //         picture_url: partialAccount.picture_url,
  //         stripe_id: partialAccount.stripe_id,
  //         settings: partialAccount.settings
  //       }
  //     : undefined,
  // });

  const getAccount = async () => {
    try {
      const { data: userData, error: userDataError } = await client
        .from('accounts')
        .select(
          `id, name, picture_url, stripe_id, settings:user_settings(picture_url)`,
        )
        .eq('primary_owner_user_id', userId)
        .eq('is_personal_account', true)
        .single();

      if (userDataError) return null;

      return userData;
    } catch (error) {
      console.error('Error fetching account:', error);
      return null;
    }
  };

  const fetchUserData = async () => {
    const response = await getAccount();
    return response;
  };

  const { data: userData } = useQuery({
    queryKey: ['account:data', userId],
    queryFn: fetchUserData,
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // initialData: partialAccount?.id
    // ? {
    //     id: partialAccount.id,
    //     name: partialAccount.name ?? '',
    //     picture_url: partialAccount.picture_url ?? null,
    //     stripe_id: partialAccount.stripe_id ?? null,
    //     settings: partialAccount.settings ?? { picture_url: null },
    //   }
    // : undefined,
  });
  
  return { userData };
}

export function useRevalidatePersonalAccountDataQuery() {
  const queryClient = useQueryClient();

  return useCallback(
    (userId: string) =>
      queryClient.invalidateQueries({
        queryKey: ['account:data', userId],
      }),
    [queryClient],
  );
}
