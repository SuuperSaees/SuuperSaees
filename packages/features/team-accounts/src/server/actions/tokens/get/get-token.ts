'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';


export const getTokenData = async (tokenId: string) => {
  try {
    const client = getSupabaseServerComponentClient({
        admin: true,
      });
    

    const { data: tokensData, error: tokensDataError } = await client
      .from('tokens')
      .select(
        `*`
      )
      .eq('id_token_provider', tokenId)
      .single();
      
    if (tokensDataError) throw new Error(tokensDataError.message);

    return tokensData;
  } catch (error) {
    console.error('Error fetching token:', error);
  }
};

