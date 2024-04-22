'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { SupabaseClient } from '@supabase/supabase-js';

import { z } from 'zod';

import { Database } from '@kit/supabase/database';
import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { AcceptInvitationSchema } from '../../schema/accept-invitation.schema';
import { DeleteInvitationSchema } from '../../schema/delete-invitation.schema';
import { InviteMembersSchema } from '../../schema/invite-members.schema';
import { RenewInvitationSchema } from '../../schema/renew-invitation.schema';
import { UpdateInvitationSchema } from '../../schema/update-invitation.schema';
import { createAccountInvitationsService } from '../services/account-invitations.service';
import { createAccountPerSeatBillingService } from '../services/account-per-seat-billing.service';

/**
 * Creates invitations for inviting members.
 */
export async function createInvitationsAction(params: {
  accountSlug: string;
  invitations: z.infer<typeof InviteMembersSchema>['invitations'];
}) {
  const client = getSupabaseServerActionClient();

  await assertSession(client);

  const { invitations } = InviteMembersSchema.parse({
    invitations: params.invitations,
  });

  // Create the service
  const service = createAccountInvitationsService(client);

  // send invitations
  await service.sendInvitations({
    invitations,
    accountSlug: params.accountSlug,
  });

  revalidateMemberPage();

  return {
    success: true,
  };
}

/**
 * Deletes an invitation specified by the invitation ID.
 *
 * @param {Object} params - The parameters for the method.
 * @param {string} params.invitationId - The ID of the invitation to be deleted.
 *
 * @return {Object} - The result of the delete operation.
 */
export async function deleteInvitationAction(
  params: z.infer<typeof DeleteInvitationSchema>,
) {
  const invitation = DeleteInvitationSchema.parse(params);

  const client = getSupabaseServerActionClient();
  const { data, error } = await client.auth.getUser();

  if (error ?? !data.user) {
    throw new Error(`Authentication required`);
  }

  const service = createAccountInvitationsService(client);

  // Delete the invitation
  await service.deleteInvitation(invitation);

  revalidateMemberPage();

  return { success: true };
}

export async function updateInvitationAction(
  params: z.infer<typeof UpdateInvitationSchema>,
) {
  const client = getSupabaseServerActionClient();
  const invitation = UpdateInvitationSchema.parse(params);

  await assertSession(client);

  const service = createAccountInvitationsService(client);

  await service.updateInvitation(invitation);

  revalidateMemberPage();

  return { success: true };
}

export async function acceptInvitationAction(data: FormData) {
  const client = getSupabaseServerActionClient();

  const { inviteToken, nextPath } = AcceptInvitationSchema.parse(
    Object.fromEntries(data),
  );

  // Ensure the user is authenticated
  const user = await assertSession(client);

  // create the services
  const perSeatBillingService = createAccountPerSeatBillingService(client);
  const service = createAccountInvitationsService(client);

  // Accept the invitation
  const accountId = await service.acceptInvitationToTeam(
    getSupabaseServerActionClient({ admin: true }),
    {
      inviteToken,
      userId: user.id,
    },
  );

  // If the account ID is not present, throw an error
  if (!accountId) {
    throw new Error('Failed to accept invitation');
  }

  // Increase the seats for the account
  await perSeatBillingService.increaseSeats(accountId);

  return redirect(nextPath);
}

export async function renewInvitationAction(
  params: z.infer<typeof RenewInvitationSchema>,
) {
  const client = getSupabaseServerActionClient();
  const { invitationId } = RenewInvitationSchema.parse(params);

  await assertSession(client);

  const service = createAccountInvitationsService(client);

  // Renew the invitation
  await service.renewInvitation(invitationId);

  revalidateMemberPage();

  return {
    success: true,
  };
}

async function assertSession(client: SupabaseClient<Database>) {
  const { error, data } = await requireUser(client);

  if (error) {
    throw new Error(`Authentication required`);
  }

  return data;
}

function revalidateMemberPage() {
  revalidatePath('/home/[account]/members', 'page');
}
