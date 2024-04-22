'use server';

import { revalidatePath } from 'next/cache';

import { SupabaseClient } from '@supabase/supabase-js';

import { z } from 'zod';

import { Database } from '@kit/supabase/database';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { RemoveMemberSchema } from '../../schema/remove-member.schema';
import { TransferOwnershipConfirmationSchema } from '../../schema/transfer-ownership-confirmation.schema';
import { UpdateMemberRoleSchema } from '../../schema/update-member-role.schema';
import { createAccountMembersService } from '../services/account-members.service';

export async function removeMemberFromAccountAction(
  params: z.infer<typeof RemoveMemberSchema>,
) {
  const client = getSupabaseServerActionClient();
  const { data, error } = await client.auth.getUser();

  if (error ?? !data.user) {
    throw new Error(`Authentication required`);
  }

  const { accountId, userId } = RemoveMemberSchema.parse(params);

  const service = createAccountMembersService(client);

  await service.removeMemberFromAccount({
    accountId,
    userId,
  });

  // revalidate all pages that depend on the account
  revalidatePath('/home/[account]', 'layout');

  return { success: true };
}

export async function updateMemberRoleAction(
  params: z.infer<typeof UpdateMemberRoleSchema>,
) {
  const client = getSupabaseServerActionClient();

  await assertSession(client);

  const service = createAccountMembersService(client);
  const adminClient = getSupabaseServerActionClient({ admin: true });

  // update the role of the member
  await service.updateMemberRole(
    {
      accountId: params.accountId,
      userId: params.userId,
      role: params.role,
    },
    adminClient,
  );

  // revalidate all pages that depend on the account
  revalidatePath('/home/[account]', 'layout');

  return { success: true };
}

export async function transferOwnershipAction(
  params: z.infer<typeof TransferOwnershipConfirmationSchema>,
) {
  const client = getSupabaseServerActionClient();

  const { accountId, userId } =
    TransferOwnershipConfirmationSchema.parse(params);

  // assert that the user is authenticated
  await assertSession(client);

  // assert that the user is the owner of the account
  const { data: isOwner, error } = await client.rpc('is_account_owner', {
    account_id: accountId,
  });

  if (error ?? !isOwner) {
    throw new Error(
      `You must be the owner of the account to transfer ownership`,
    );
  }

  const service = createAccountMembersService(client);

  // at this point, the user is authenticated and is the owner of the account
  // so we proceed with the transfer of ownership with admin privileges
  const adminClient = getSupabaseServerActionClient({ admin: true });

  await service.transferOwnership(
    {
      accountId,
      userId,
      confirmation: params.confirmation,
    },
    adminClient,
  );

  // revalidate all pages that depend on the account
  revalidatePath('/home/[account]', 'layout');

  return {
    success: true,
  };
}

async function assertSession(client: SupabaseClient<Database>) {
  const { data, error } = await client.auth.getUser();

  if (error ?? !data.user) {
    throw new Error(`Authentication required`);
  }
}
