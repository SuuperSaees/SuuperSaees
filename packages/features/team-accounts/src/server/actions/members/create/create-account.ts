'use server';

import { SupabaseClient } from '@supabase/supabase-js';



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Account } from '../../../../../../../../apps/web/lib/account.types';
import { Organization } from '../../../../../../../../apps/web/lib/organization.types';
import { Database } from '../../../../../../../../apps/web/lib/database.types';

export const addUserAccountRole = async (
  organizationId: Organization.Type['id'],
  userId: Account.Type['id'],
  accountRole: Account.Relationships.Membership['account_role'],
  databaseClient?: SupabaseClient<Database>,
  adminActivated = false,
) => {
  databaseClient =
    databaseClient ??
    getSupabaseServerComponentClient({
      admin: adminActivated,
    });
  try {
    const { data: accountRoleData, error: accountRoleError } =
      await databaseClient.from('accounts_memberships').insert({
        organization_id: organizationId,
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