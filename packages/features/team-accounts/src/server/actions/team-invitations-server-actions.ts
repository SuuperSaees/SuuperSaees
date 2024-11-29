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
    const { error: userError } = await client.auth.getUser();

    if (userError) throw new Error(userError.message);

    // Fetch users who already belong to an organization (using their email)
    const { data: invitedUsers, error: invitedUsersError } = await client
      .from('accounts')
      .select('email, organization_id')
      .in(
        'email',
        params.invitations.map((invitation) => invitation.email),
      );

    if (invitedUsersError) {
      console.error('Failed to retrieve invited users');
      throw new Error(invitedUsersError.message);
    }

    // Filter out invitations where the user already belongs to any organization
    const filteredInvitations = params.invitations.filter((invitation) => {
      const user = invitedUsers.find((u) => u.email === invitation.email);
      return !user ?? !user?.organization_id; // Only invite if the user is not part of any organization
    });

    // If there are no new invitations to send, return early
    if (filteredInvitations.length === 0) {
      console.error('Failed to send the invitation');
      throw new Error('No users available to send the invitation');
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

    // Create the services
    const perSeatBillingService = createAccountPerSeatBillingService(client);
    const service = createAccountInvitationsService(client);

    // Check if the user already belongs to any organization
    const { data: existingUser, error: existingUserError } = await client
      .from('accounts')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (existingUserError) {
      console.error('Failed to retrieve user organization data');
      throw new Error(existingUserError.message);
    }

    // If the user already belongs to an organization, deny the invitation
    if (existingUser?.organization_id) {
      throw new Error(
        'You are already a member of an organization and cannot accept this invitation.',
      );
    }

    // Get the organization of the sender
    const { data: senderAccount, error: senderAccountError } = await client
      .from('invitations')
      .select('invited_by')
      .eq('invite_token', inviteToken)
      .single();

    if (senderAccountError) {
      console.error('Failed to obtain the sender account');
      throw new Error(senderAccountError.message);
    }

    // Get the organization ID of the sender
    const { data: senderOrganization, error: senderOrganizationError } =
      await client
        .from('accounts')
        .select('organization_id')
        .eq('id', senderAccount.invited_by)
        .single();

    if (senderOrganizationError) {
      console.error('Failed to obtain the sender organization');
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

    // Associate the new member with the sender's organization
    const { error: associateMemberError } = await client
      .from('accounts')
      .update({ organization_id: senderOrganization?.organization_id })
      .eq('id', user.id);
      
    if (associateMemberError) {
      console.error('Failed to associate member with organization');
      throw new Error(associateMemberError.message);
    }
    // Increase the seats for the account
    await perSeatBillingService.increaseSeats(accountId).catch((error) => {
      console.error('Failed to increase seats', error);
      throw new Error(error.message);
    });

    // Redirect to the next path
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