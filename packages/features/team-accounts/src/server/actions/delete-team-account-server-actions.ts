'use server';

import { redirect } from 'next/navigation';

import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';
import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { DeleteTeamAccountSchema } from '../../schema/delete-team-account.schema';
import { createDeleteTeamAccountService } from '../services/delete-team-account.service';

export async function deleteTeamAccountAction(formData: FormData) {
  const params = DeleteTeamAccountSchema.parse(
    Object.fromEntries(formData.entries()),
  );

  const client = getSupabaseServerActionClient();
  const auth = await requireUser(client);

  if (auth.error) {
    throw new Error('Authentication required');
  }

  // Check if the user has the necessary permissions to delete the team account
  await assertUserPermissionsToDeleteTeamAccount(client, params.accountId);

  // Get the Supabase client and create a new service instance.
  const service = createDeleteTeamAccountService();

  // Delete the team account and all associated data.
  await service.deleteTeamAccount(
    getSupabaseServerActionClient({
      admin: true,
    }),
    {
      accountId: params.accountId,
      userId: auth.data.id,
    },
  );

  return redirect('/home');
}

async function assertUserPermissionsToDeleteTeamAccount(
  client: SupabaseClient<Database>,
  accountId: string,
) {
  const auth = await requireUser(client);

  if (auth.error ?? !auth.data.id) {
    throw new Error('Authentication required');
  }

  const userId = auth.data.id;

  const { data, error } = await client
    .from('accounts')
    .select('id')
    .eq('primary_owner_user_id', userId)
    .eq('is_personal_account', false)
    .eq('id', accountId);

  if (error ?? !data) {
    throw new Error('Account not found');
  }
}
