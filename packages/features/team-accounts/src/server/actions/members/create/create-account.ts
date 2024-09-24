'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import { Account } from '../../../../../../../../apps/web/lib/account.types';
import { Database } from '../../../../../../../../apps/web/lib/database.types';

export const addUserAccountRole = async (
  databaseClient: SupabaseClient<Database>,
  accountId: Account.Relationships.Membership['account_id'],
  userId: Account.Type['id'],
  accountRole: Account.Relationships.Membership['account_role'],
) => {
  try {
    const { data: accountRoleData, error: accountRoleError } =
      await databaseClient.from('accounts_memberships').insert({
        account_id: accountId,
        user_id: userId,
        account_role: accountRole,
      });

    if (accountRoleError) {
      throw new Error(
        `Error adding the role to the account: ${accountRoleError.message}`,
      );
    }

    return accountRoleData;
  } catch (error) {
    console.error(`Error adding the role to the account`, error);
    throw error;
  }
};
