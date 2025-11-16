import { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { getLogger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';
import { OrganizationSettings } from '../../../../../../../apps/web/lib/organization-settings.types';
import { getDomainByOrganizationId } from '../../../../../../../packages/multitenancy/utils/get/get-domain';
import { getOrganizationSettingsByOrganizationId } from '../../actions/organizations/get/get-organizations';

type Invitation = Database['public']['Tables']['invitations']['Row'];

const invitePath = '/join';
const siteURL = process.env.NEXT_PUBLIC_SITE_URL;
// const isProd = process.env.NEXT_PUBLIC_IS_PROD === 'true';
const productName = process.env.NEXT_PUBLIC_PRODUCT_NAME ?? '';
const SUUPER_CLIENT_ID = process.env.NEXT_PUBLIC_SUUPER_CLIENT_ID;
const SUUPER_CLIENT_SECRET = process.env.NEXT_PUBLIC_SUUPER_CLIENT_SECRET;
const emailSender = process.env.EMAIL_SENDER;
// const brandtopAgencyName = process.env.NEXT_PUBLIC_BRANDTOP_AGENCY_NAME ?? '';
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
    // brandtopAgencyName: z.string(),
  })
  .parse({
    invitePath,
    siteURL,
    productName,
    emailSender,
    // brandtopAgencyName,
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

    const { data: verifyExistingAccount } = await this.adminClient
      .from('accounts')
      .select('id')
      .eq('email', invitation.email)
      .single();

    if (verifyExistingAccount?.id) {
      logger.info(
        { invitation, name: this.namespace },
        'Account already exists. Skipping invitation email...',
      );
      return;
    }

    const inviter = await this.adminClient
      .from('accounts')
      .select('email, name')
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

    const inviterOrganizationSettings =
      await getOrganizationSettingsByOrganizationId(
        invitation.organization_id ?? '',
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
      .from('organizations')
      .select('name')
      .eq('id', invitation.organization_id)
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
      const domain = await getDomainByOrganizationId(
        invitation.organization_id ?? '',
        true,
        true,
      );

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
        teamName: team.data.name ?? '',
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
      const data = await res.clone().json();

      if (!res.ok) {
        console.error('Failed to send invitation email', data);
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