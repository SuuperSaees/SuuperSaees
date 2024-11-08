'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export const deleteToken = async (tokenId: string) => {
  try {
    const client = getSupabaseServerComponentClient({
      admin: true,
    });

    const { data: tokensData, error: tokensDataError } = await client
      .from('tokens')
      .delete()
      .eq('id_token_provider', tokenId);

    if (tokensDataError) throw new Error(tokensDataError.message);

    return tokensData;
  } catch (error) {
    console.error('Error fetching token:', error);
  }
};
