'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { User } from '../../../../../../../../apps/web/lib/user.types';


export const updateAccountData = async (accountId: string, accountData: User.Update) => {
  try {
    const client = getSupabaseServerComponentClient();

    const { data: userData, error: userDataError } = await client
        .from('accounts')
        .update(accountData)
        .eq('id', accountId)
        .select(`id, name, phone_number, email`)
        .single();
      
    if (userDataError) throw new Error(userDataError.message);

    return userData;
  } catch (error) {
    console.error('Error updating account:', error);
  }
};

