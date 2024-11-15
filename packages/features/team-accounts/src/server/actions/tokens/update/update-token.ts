'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Tokens } from '../../../../../../../../apps/web/lib/tokens.types';


export const updateTokenData = async (tokenId: string, tokenData: Tokens.Update) => {
  try {
    const client = getSupabaseServerComponentClient();
    

    const { data: tokensData, error: tokensDataError } = await client
        .from('tokens')
        .update(tokenData)
        .eq('id_token_provider', tokenId)
        .select(`id`)
        .single();
      
    if (tokensDataError) throw new Error(tokensDataError.message);

    return tokensData;
  } catch (error) {
    console.error('Error fetching token:', error);
  }
};

