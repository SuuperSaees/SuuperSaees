'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';


export async function getPrimaryOwnerId() {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError;

    const { data: accountsData } = await client
      .from('accounts')
      .select()
      .eq('primary_owner_user_id', userData.user.id);

    const filteredAccounts = accountsData?.filter(
      (account) => account.id !== userData.user.id,
    );
    const accountIds = filteredAccounts?.map((account) => account.id) ?? [];

    if (accountIds.length > 0) {
      const firstAccountId = accountIds[0];

      return firstAccountId;
    }
    throw new Error('Error fetching primary owner');
  } catch (error) {
    console.error('Error fetching primary owner:', error);
    // throw error;
  }
}

// get a given user

export async function getUserById(userId: string) {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userAuthenticatedError } = await client.auth.getUser();

    if (userAuthenticatedError) throw userAuthenticatedError;

    const { data: userData, error: userError } = await client
      .from('accounts')
      .select('name, email, id, picture_url')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    return userData;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}