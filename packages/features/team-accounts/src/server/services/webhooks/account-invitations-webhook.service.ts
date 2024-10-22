import { SupabaseClient } from '@supabase/supabase-js';

import { z } from 'zod';

import { getLogger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

type Invitation = Database['public']['Tables']['invitations']['Row'];

const invitePath = '/join';
const siteURL = process.env.NEXT_PUBLIC_SITE_URL;
const productName = process.env.NEXT_PUBLIC_PRODUCT_NAME ?? '';
const emailSender = process.env.EMAIL_SENDER;
const brandtopAgencyName = process.env.NEXT_PUBLIC_BRANDTOP_AGENCY_NAME ?? '';

const env = z
  .object({
    invitePath: z.string().min(1),
    siteURL: z.string().min(1),
    productName: z.string(),
    emailSender: z.string().email(),
    brandtopAgencyName: z.string(),
  })
  .parse({
    invitePath,
    siteURL,
    productName,
    emailSender,
    brandtopAgencyName,
  });

export function createAccountInvitationsWebhookService(
  client: SupabaseClient<Database>,
) {
  return new AccountInvitationsWebhookService(client);
}

class AccountInvitationsWebhookService {
  private namespace = 'accounts.invitations.webhook';

  constructor(private readonly adminClient: SupabaseClient<Database>) {}

  /**
   * @name handleInvitationWebhook
   * @description Handles the webhook event for invitations
   * @param invitation
   */
  async handleInvitationWebhook(invitation: Invitation) {
    return this.dispatchInvitationEmail(invitation);
  }

  private async dispatchInvitationEmail(invitation: Invitation) {
    const logger = await getLogger();

    logger.info(
      { invitation, name: this.namespace },
      'Handling invitation webhook event...',
    );

    const inviter = await this.adminClient
      .from('accounts')
      .select('email, name, organization_id')
      .eq('id', invitation.invited_by)
      .single();

    if (inviter.error) {
      logger.error(
        {
          error: inviter.error,
          name: this.namespace,
        },
        'Failed to fetch inviter details',
      );

      throw inviter.error;
    }

    let inviterOrganizationLogo = '';
    let inviterOrganizationThemeColor = '';

    // search organixation name 
    const inviterOrganization = await this.adminClient
      .from('accounts')
      .select('name')
      .eq('id', inviter.data.organization_id ?? '')
      .single();

    if (inviterOrganization.error) {
      logger.error(
        {
          error: inviterOrganization.error,
          name: this.namespace,
        },
        'Failed to fetch inviter organization name',
      );
    }

    const inviterOrganizationSettings = await this.adminClient
      .from('organization_settings')
      .select('key, value')
      .eq('account_id', inviter.data.organization_id ?? '')
      .in('key', ['logo_url', 'theme_color']);

    if (inviterOrganizationSettings.error) {
      logger.error(
        {
          error: inviterOrganizationSettings.error,
          name: this.namespace,
        },
        'Failed to fetch inviter organization logo',
      );
    }

    if (inviterOrganizationSettings && !inviterOrganizationSettings.error) {
      inviterOrganizationSettings.data.forEach((setting) => {
        if (setting.key === 'logo_url') {
          inviterOrganizationLogo = setting.value;
        } else if (setting.key === 'theme_color') {
          inviterOrganizationThemeColor = setting.value;
        }
      });
    }

    const team = await this.adminClient
      .from('accounts')
      .select('name')
      .eq('id', invitation.account_id)
      .single();

    if (team.error) {
      logger.error(
        {
          error: team.error,
          name: this.namespace,
        },
        'Failed to fetch team details',
      );

      throw team.error;
    }

    const ctx = {
      invitationId: invitation.id,
      name: this.namespace,
    };

    logger.info(ctx, 'Invite retrieved. Sending invitation email...');

    try {
      const { renderInviteEmail } = await import('@kit/email-templates');
      const { getMailer } = await import('@kit/mailers');
      const mailer = await getMailer();
      const link = this.getInvitationLink(
        invitation.invite_token,
        invitation.email,
      );

      const { html, subject } = await renderInviteEmail({
        link,
        invitedUserEmail: invitation.email,
        inviter: inviter.data.name ?? inviter.data.email ?? '',
        productName: env.productName,
        teamName: team.data.name,
        logoUrl: inviterOrganizationLogo,
        primaryColor: inviterOrganizationThemeColor,
      });

      const BRANDTOP_AGENCY_NAME = env.brandtopAgencyName ?? '';
    const BRANDTOP_EMAIL_SENDER = `Luz de ${inviterOrganization.data?.name} <${emailSender}>`;

      await mailer
        .sendEmail({
          from:
            inviterOrganization.data?.name === BRANDTOP_AGENCY_NAME
              ? BRANDTOP_EMAIL_SENDER
              : env.emailSender,
          to: invitation.email,
          subject,
          html,
        })
        .then(() => {
          logger.info(ctx, 'Invitation email successfully sent!');
        })
        .catch((error) => {
          console.error(error);

          logger.error({ error, ...ctx }, 'Failed to send invitation email');
        });

      // obtain subscription id
      const { data: subscriptionData, error: subscriptionError } =
        await this.adminClient
          .from('subscriptions')
          .select('id')
          .eq('propietary_organization_id', invitation.invited_by)
          .single();

      if (subscriptionError) {
        logger.error(
          {
            error: subscriptionError,
            name: this.namespace,
          },
          'Failed to update team subscription',
        );

        throw subscriptionError;
      }

      // obtain members count with that organization
      let { count: membersCount, error: membersCountError } =
        await this.adminClient
          .from('accounts_memberships')
          .select('*', { count: 'exact' })
          .eq('account_id', invitation.invited_by)
          .or(
            'account_role.eq.agency_member,account_role.eq.agency_project_manager',
          );

      if (membersCountError) {
        logger.error(
          {
            error: membersCountError,
            name: this.namespace,
          },
          'Failed to update team subscription, obtaining members count',
        );
        throw membersCountError;
      }
      if (membersCount) {
        membersCount += 1;
      }

      // get stripe subscription
      const responseGetSubscription = await fetch(
        `${siteURL}/api/stripe/get-subscription?subscriptionId=${encodeURIComponent(subscriptionData?.id ?? '')}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (!responseGetSubscription.ok) {
        throw new Error('Failed to fetch subscription');
      }
      const dataSubscription = await responseGetSubscription.json();
      // update subscription in stripe
      const responseUpdateSubscription = await fetch(
        `${siteURL}/api/stripe/update-subscription?subscriptionId=${encodeURIComponent(subscriptionData?.id ?? '')}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            itemQuantity: membersCount ?? 0,
            itemId: dataSubscription?.items[0]?.id,
          }),
        },
      );
      if (!responseUpdateSubscription.ok) {
        throw new Error('Failed to update subscription');
      }
      return {
        success: true,
      };
    } catch (error) {
      console.error(error);
      logger.warn({ error, ...ctx }, 'Failed to invite user to team');

      return {
        error,
        success: false,
      };
    }
  }

  private getInvitationLink(token: string, email: string) {
    const searchParams = new URLSearchParams({
      invite_token: token,
      email,
    }).toString();

    const href = new URL(env.invitePath, env.siteURL).href;

    return `${href}?${searchParams}`;
  }
}