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
import { generateMagicLinkRecoveryPassword } from '../actions/members/update/update-account';
import { createToken } from '../../../../../tokens/src/create-token';
import { TokenRecoveryType } from '../../../../../tokens/src/domain/token-type';
import { getClientConfirmEmailTemplate } from '../actions/clients/send-email/utils/client-confirm-email-template';
import { getTextColorBasedOnBackground } from '../utils/generate-colors';
import { getDomainByOrganizationId } from '../../../../../multitenancy/utils/get/get-domain';
import { getOrganizationSettingsByOrganizationId } from './organizations/get/get-organizations';
import {
  langKey,
  logoUrlKey,
  themeColorKey,
  senderNameKey,
  senderDomainKey,
  senderEmailKey,
  defaultSenderEmail,
  defaultSenderDomain,
  defaultSenderLogo,
  defaultSenderColor,
  defaultAgencyName,
  defaultAgencySenderName,
  portalNameKey,
} from '../actions/clients/create/create-client.types';
import { v4 as uuidv4 } from 'uuid';
const SUUPER_CLIENT_ID = process.env.SUUPER_CLIENT_ID;
const SUUPER_CLIENT_SECRET = process.env.SUUPER_CLIENT_SECRET;



export const createInvitationsAction = enhanceAction(
  async (params) => {
    const client = getSupabaseServerActionClient();

    // Fetch users who already belong to an organization (using their email)
    const { data: existingUsers, error: existingUsersError } = await client
      .from('accounts')
      .select('id, email, deleted_on, organization_id')
      .in(
        'email',
        params.invitations.map((invitation) => invitation.email),
      );

    if (existingUsersError) {
      console.error('Failed to retrieve existing users');
      throw new Error(existingUsersError.message);
    }

    // Fetch existing memberships for all users
    const { data: existingMemberships } = await client
      .from('accounts_memberships')
      .select('user_id')
      .in(
        'user_id',
        existingUsers?.map(user => user.id) || []
      );

    // Separate invitations into new users and users to reactivate
    const newInvitations = [];
    const usersToReactivate = [];

    for (const invitation of params.invitations) {
      const existingUser = existingUsers?.find(u => u.email === invitation.email);
      const hasMembership = existingMemberships?.some(m => m.user_id === existingUser?.id);
      
      if (existingUser && (existingUser.deleted_on ?? !hasMembership)) {
        usersToReactivate.push({
          ...invitation,
          userId: existingUser.id
        });
      } else if (!existingUser) {
        newInvitations.push(invitation);
      }
    }

    if (!usersToReactivate.length && !newInvitations.length) {
      throw new Error('No invitations to process');
    }

    const { data: organizationAccount, error: organizationAccountError } = await client
      .from('accounts')
      .select('id, name, primary_owner_user_id')
      .eq('slug', params.accountSlug)
      .single();
      
    if (organizationAccountError) {
      console.error('Failed to retrieve organization account');
      throw new Error(organizationAccountError.message);
    }

    // Get organization settings and send reactivation email
    const domain = await getDomainByOrganizationId(organizationAccount.id, true, true);
    const settings = await getOrganizationSettingsByOrganizationId(
      organizationAccount.id,
      true,
      [logoUrlKey, themeColorKey, senderNameKey, senderDomainKey, senderEmailKey, langKey, portalNameKey],
      client
    );

    let logoUrl = defaultSenderLogo,
    agencyName = organizationAccount.name ?? defaultAgencyName,
    themeColor = defaultSenderColor,
    senderName = '',
    senderEmail = defaultSenderEmail,
    senderDomain = defaultSenderDomain,
    lang: 'en' | 'es' = 'en';

    // ... Configure email settings from organization settings ...

    settings.forEach((setting) => {
      if (setting.key === logoUrlKey) {
        logoUrl = setting.value;
      } else if (setting.key === themeColorKey) {
        themeColor = setting.value;
      } else if (setting.key === senderNameKey) {
        senderName = setting.value;
      } else if (setting.key === senderEmailKey) {
        senderEmail = setting.value;
      } else if (setting.key === senderDomainKey) {
        senderDomain = setting.value;
      } else if (setting.key === langKey) {
        lang = setting.value as 'en' | 'es';
      } else if (setting.key === portalNameKey) {
        agencyName = setting.value;
      }
    });
    const baseUrl = domain;
   

    // Handle reactivations asynchronously
    const reactivationPromises = usersToReactivate.map(async (user) => {
      try {
        await client.from('accounts')
          .update({ deleted_on: null, organization_id: null })
          .eq('id', user.userId);

        const hasMembership = existingMemberships?.some(m => m.user_id === user.userId);
        
        if (hasMembership) {
          await client.from('accounts_memberships')
            .delete()
            .eq('user_id', user.userId);
        }

        const generatedMagicLink = await generateMagicLinkRecoveryPassword(
          user.email,
          undefined,
          true
        );

        const tokenRecoveryType: TokenRecoveryType = {
          email: user.email,
          redirectTo: generatedMagicLink,
        };

        const { tokenId } = await createToken(tokenRecoveryType);
        const invitationId = uuidv4();

        const { error: invitationError } = await client
          .from('invitations')
          .insert({
            account_id: organizationAccount.id,
            invited_by: organizationAccount.primary_owner_user_id,
            email: user.email,
            invite_token: invitationId,
            role: user.role,
            expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
          }).select('*').single();

        if (invitationError) throw new Error(invitationError.message);

        const acceptInvitationUrl = `${domain}/auth/confirm?token_hash_recovery=${tokenId}&email=${user.email}&type=recovery&next=${domain}/join?invite_token=${invitationId}&email=${user.email}`;

        const { template, t } = getClientConfirmEmailTemplate(
          user.email,
          baseUrl,
          tokenId,
          acceptInvitationUrl,
          lang,
          agencyName,
          logoUrl,
          themeColor,
          getTextColorBasedOnBackground(themeColor),
          'invitation'
        );

        const fromSenderIdentity = senderName
          ? `${senderName} <${senderEmail}@${senderDomain}>`
          : `${defaultAgencySenderName} ${t('at')} ${defaultAgencyName} <${senderEmail}@${senderDomain}>`;

        return fetch(`${domain}/api/v1/mailer`, {
          method: 'POST',
          headers: new Headers({
            Authorization: `Basic ${btoa(`${SUUPER_CLIENT_ID}:${SUUPER_CLIENT_SECRET}`)}`,
          }),
          body: JSON.stringify({
            from: fromSenderIdentity,
            to: [user.email],
            subject: t('subject', { agencyName }),
            html: template,
          }),
        });
      } catch (error) {
        console.error('Failed to process reactivation for user:', user.email, error);
        // No lanzamos el error para que no detenga el proceso completo
        return null;
      }
    });

    // Process reactivations in parallel
    await Promise.allSettled(reactivationPromises);

    // Handle new invitations
    if (newInvitations.length > 0) {
      const service = createAccountInvitationsService(client);
      await service.sendInvitations({
        ...params,
        invitations: newInvitations,
      });
    }

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