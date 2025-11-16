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
      }
    | undefined,
) {
  const client = useSupabase();
  const queryKey = ['account:data', userId];
  const queryFn = async () => {
    if (!userId) {
      return null;
    }

    const response = await client
      .from('accounts')
      .select(
        `
        id,
        name,
        picture_url,
        settings:user_settings(name,picture_url)
    `,
      )
      .eq('id', userId)
      .single();

    const transformerResponse = {
      id: response.data?.id,
      name: response.data?.settings?.name ?? response.data?.name,
      picture_url:
        response.data?.settings?.picture_url ?? response.data?.picture_url,
    };

    if (response.error) {
      throw response.error;
    }

    return transformerResponse;
  };

  return useQuery({
    queryKey,
    queryFn,
    enabled: !!userId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    initialData: partialAccount?.id
      ? {
          id: partialAccount.id ?? undefined,
          name: partialAccount.name ?? undefined,
          picture_url: partialAccount.picture_url ?? undefined,
          stripe_id: partialAccount.stripe_id ?? undefined,
        }
      : undefined,
  });
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
