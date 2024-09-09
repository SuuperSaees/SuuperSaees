'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';



import { z } from 'zod';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { AcceptInvitationSchema } from '../../schema/accept-invitation.schema';
import { DeleteInvitationSchema } from '../../schema/delete-invitation.schema';
import { InviteMembersSchema } from '../../schema/invite-members.schema';
import { RenewInvitationSchema } from '../../schema/renew-invitation.schema';
import { UpdateInvitationSchema } from '../../schema/update-invitation.schema';
import { createAccountInvitationsService } from '../services/account-invitations.service';
import { createAccountPerSeatBillingService } from '../services/account-per-seat-billing.service';

export const createInvitationsAction = enhanceAction(
  async (params) => {
    const client = getSupabaseServerActionClient();

    // Check if the user is authenticated
    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser();

    if (userError) throw userError.message;

    const { data: userAccount, error: userAccountError } = await client
      .from('accounts')
      .select('organization_id')
      .eq('id', user?.id ?? '')
      .single();
    if (userAccountError) throw userAccountError.message;
    // Fetch all existing members for the account
    const { data: existingMembers, error: existingMembersError } = await client
      .from('accounts')
      .select('email')
      .eq('organization_id', userAccount.organization_id ?? ''); // Adjust if needed to `organization_id` or a specific `account_id`

    if (existingMembersError) {
      console.error('Failed to retrieve existing members');
      throw new Error(existingMembersError.message);
    }

    // Map existing invitations to an array of emails
    const existingEmails = existingMembers?.map((member) => member.email) ?? [];
    // console.log('existingEmails', existingEmails, params.invitations);
    // Filter out the emails that are already invited
    const filteredInvitations = params.invitations.filter(
      (invitation) => !existingEmails.includes(invitation.email),
    );

    // If there are no new invitations to send, return early
    if (filteredInvitations.length === 0) {
      // console.log('No new invitations to send');
      return { success: true };
    }

    // Update params with the filtered invitations
    const updatedParams = {
      ...params,
      invitations: filteredInvitations,
    };

    // Create the service
    const service = createAccountInvitationsService(client);

    // Send the filtered invitations
    await service.sendInvitations(updatedParams);

    // Revalidate the member page
    revalidateMemberPage();

    return {
      success: true,
    };
  },
  {
    schema: InviteMembersSchema.and(
      z.object({
        accountSlug: z.string().min(1),
      }),
    ),
  },
);

/**
 * @name deleteInvitationAction
 * @description Deletes an invitation specified by the invitation ID.
 */
export const deleteInvitationAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerActionClient();
    const service = createAccountInvitationsService(client);

    // Delete the invitation
    await service.deleteInvitation(data);

    revalidateMemberPage();

    return {
      success: true,
    };
  },
  {
    schema: DeleteInvitationSchema,
  },
);

/**
 * @name updateInvitationAction
 * @description Updates an invitation.
 */
export const updateInvitationAction = enhanceAction(
  async (invitation) => {
    const client = getSupabaseServerActionClient();
    const service = createAccountInvitationsService(client);

    await service.updateInvitation(invitation);

    revalidateMemberPage();

    return {
      success: true,
    };
  },
  {
    schema: UpdateInvitationSchema,
  },
);

/**
 * @name acceptInvitationAction
 * @description Accepts an invitation to join a team.
 */
export const acceptInvitationAction = enhanceAction(
  async (data: FormData, user) => {
    const client = getSupabaseServerActionClient();

    const { inviteToken, nextPath } = AcceptInvitationSchema.parse(
      Object.fromEntries(data),
    );

    // create the services
    const perSeatBillingService = createAccountPerSeatBillingService(client);
    const service = createAccountInvitationsService(client);

    // get the organization of the sender
    const { data: senderAccount, error: senderAccountError } = await client
      .from('invitations')
      .select('invited_by')
      .eq('invite_token', inviteToken)
      .single();

    if (senderAccountError) {
      console.error('Fail to obtainer the sender account');
      throw new Error(senderAccountError.message);
    }

    // get the organization id of the sender
    const { data: senderOrganization, error: senderOrganizationError } =
      await client
        .from('accounts')
        .select('organization_id')
        .eq('id', senderAccount.invited_by)
        .single();

    if (senderOrganizationError) {
      console.error('Fail to obtainer the sender organization');
      throw new Error(senderOrganizationError.message);
    }

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

    // Associate the new member with the organization
    await client
      .from('accounts')
      .update({ organization_id: senderOrganization?.organization_id })
      .eq('id', user.id);

    // Increase the seats for the account
    await perSeatBillingService.increaseSeats(accountId);

    return redirect(nextPath);
  },
  {},
);

/**
 * @name renewInvitationAction
 * @description Renews an invitation.
 */
export const renewInvitationAction = enhanceAction(
  async (params) => {
    const client = getSupabaseServerActionClient();
    const { invitationId } = RenewInvitationSchema.parse(params);

    const service = createAccountInvitationsService(client);

    // Renew the invitation
    await service.renewInvitation(invitationId);

    revalidateMemberPage();

    return {
      success: true,
    };
  },
  {
    schema: RenewInvitationSchema,
  },
);

function revalidateMemberPage() {
  revalidatePath('/home/[account]/members', 'page');
}