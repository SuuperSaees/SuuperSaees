import { SupabaseClient } from '@supabase/supabase-js';



import { z } from 'zod';



import { getLogger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';



import { OrganizationSettings } from '../../../../../../../apps/web/lib/organization-settings.types';
import { getDomainByOrganizationId } from '../../../../../../../packages/multitenancy/utils/get/get-domain';
import { getOrganizationSettingsByOrganizationId } from '../../actions/organizations/get/get-organizations';


// import { getOrganizationById } from '../../actions/organizations/get/get-organizations';

type Invitation = Database['public']['Tables']['invitations']['Row'];

const invitePath = '/join';
const siteURL = process.env.NEXT_PUBLIC_SITE_URL;
const isProd = process.env.NEXT_PUBLIC_IS_PROD === 'true';
const productName = process.env.NEXT_PUBLIC_PRODUCT_NAME ?? '';
const SUUPER_CLIENT_ID = process.env.NEXT_PUBLIC_SUUPER_CLIENT_ID;
const SUUPER_CLIENT_SECRET = process.env.NEXT_PUBLIC_SUUPER_CLIENT_SECRET;
const emailSender = process.env.EMAIL_SENDER;
const brandtopAgencyName = process.env.NEXT_PUBLIC_BRANDTOP_AGENCY_NAME ?? '';
const themeColorKey = OrganizationSettings.KEYS.theme_color;
const senderNameKey = OrganizationSettings.KEYS.sender_name;
const logoUrlKey = OrganizationSettings.KEYS.logo_url;
const senderEmailKey = OrganizationSettings.KEYS.sender_email;
const senderDomainKey = OrganizationSettings.KEYS.sender_domain;
const defaultAgencySenderName =
  OrganizationSettings.EXTRA_KEYS.default_sender_name;
const defaultAgencyName = OrganizationSettings.EXTRA_KEYS.default_agency_name;
const defaultSenderEmail = OrganizationSettings.EXTRA_KEYS.default_sender_email;
const defaultSenderDomain =
  OrganizationSettings.EXTRA_KEYS.default_sender_domain;

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

    // search organization name
    // const inviterOrganization = await getOrganizationById(
    //   inviter.data.organization_id ?? '',
    //   this.adminClient,
    // );

    const inviterOrganizationSettings =
      await getOrganizationSettingsByOrganizationId(
        inviter.data.organization_id ?? '',
        true,
        [
          logoUrlKey,
          themeColorKey,
          senderNameKey,
          senderEmailKey,
          senderDomainKey,
        ],
        this.adminClient,
      );
    let inviterOrganizationLogo = '',
      inviterOrganizationThemeColor = '',
      inviterOrganizationSenderName = '',
      inviterOrganizationSenderEmail = defaultSenderEmail,
      inviterOrganizationSenderDomain = defaultSenderDomain;

    inviterOrganizationSettings.forEach((setting) => {
      if (setting.key === logoUrlKey) {
        inviterOrganizationLogo = setting.value;
      } else if (setting.key === themeColorKey) {
        inviterOrganizationThemeColor = setting.value;
      } else if (setting.key === senderNameKey) {
        inviterOrganizationSenderName = setting.value;
      } else if (setting.key === senderEmailKey) {
        inviterOrganizationSenderEmail = setting.value;
      } else if (setting.key === senderDomainKey) {
        inviterOrganizationSenderDomain = setting.value;
      }
    });

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
      let domain = await getDomainByOrganizationId(
        inviter.data.organization_id ?? '',
        true,
      );
      if (domain !== siteURL) {
        domain = isProd ? `https://${domain}` : `http://${domain}`;
      }

      const { renderInviteEmail } = await import('@kit/email-templates');
      // const { getMailer } = await import('@kit/mailers');
      // const mailer = await getMailer();
      const link = this.getInvitationLink(
        invitation.invite_token,
        invitation.email,
        domain,
      );

      const { html, subject, t } = await renderInviteEmail({
        link,
        invitedUserEmail: invitation.email,
        inviter: inviter.data.name ?? inviter.data.email ?? '',
        productName: env.productName,
        teamName: team.data.name,
        logoUrl: inviterOrganizationLogo,
        primaryColor: inviterOrganizationThemeColor,
      });

      const fromSenderIdentity = inviterOrganizationSenderName
        ? `${inviterOrganizationSenderName} <${inviterOrganizationSenderEmail}@${inviterOrganizationSenderDomain}>`
        : `${defaultAgencySenderName} ${t('at')} ${defaultAgencyName} <${inviterOrganizationSenderEmail}@${inviterOrganizationSenderDomain}>`;

      const res = await fetch(`${domain}/api/v1/mailer`, {
        method: 'POST',
        headers: new Headers({
          Authorization: `Basic ${btoa(`${SUUPER_CLIENT_ID}:${SUUPER_CLIENT_SECRET}`)}`,
        }),
        body: JSON.stringify({
          from: fromSenderIdentity,
          to: [invitation.email],
          subject,
          html,
        }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        console.error('Failed to send invitation email', data);
      }

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
      let membersCount = 0;
      const { count, error: membersCountError } = await this.adminClient
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
      membersCount = count ?? 0;

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

  private getInvitationLink(token: string, email: string, domain?: string,) {
    const searchParams = new URLSearchParams({
      invite_token: token,
      email,
    }).toString();

    const href = new URL(env.invitePath, domain ?? env.siteURL).href;

    return `${href}?${searchParams}`;
  }
}