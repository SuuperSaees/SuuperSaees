'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import { Account } from '../../../../../../../../apps/web/lib/account.types';
import { Database } from '../../../../../../../../apps/web/lib/database.types';

export const updateUserAccount = async (
  databaseClient: SupabaseClient<Database>,
  userData: Account.Update,
  userId: Account.Type['id'],
) => {
  try {
    const { data: userAccountData, error: errorUpdateUserAccount } =
      await databaseClient
        .from('accounts')
        .update(userData)
        .eq('primary_owner_user_id', userId)
        .eq('is_personal_account', true);

    if (errorUpdateUserAccount)
      throw new Error(
        `Error updating the user account: ${errorUpdateUserAccount.message}`,
      );

    return userAccountData;
  } catch (error) {
    console.error('Error updating the user account', error);
    throw error;
  }
};
