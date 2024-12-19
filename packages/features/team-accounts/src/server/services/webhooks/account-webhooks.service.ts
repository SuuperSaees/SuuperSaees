// 'use server';
import { SupabaseClient } from '@supabase/supabase-js';



import { z } from 'zod';

import { getLogger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

import {
  getPrimaryOwnerId,
  getUserRoleById,
} from '../../actions/members/get/get-member-account';
import { getSubscriptionByPropietaryOrganizationId } from '../../actions/subscriptions/get/get-subscription';

type Account = Database['public']['Tables']['accounts']['Row'];

export function createAccountWebhooksService(
  adminClient: SupabaseClient<Database>,
  baseUrl: string,
) {
  return new AccountWebhooksService(adminClient, baseUrl);
}

class AccountWebhooksService {
  private readonly namespace = 'accounts.webhooks';
  private readonly adminClient: SupabaseClient<Database>;
  private readonly baseUrl: string;

  constructor(adminClient: SupabaseClient<Database>, baseUrl: string) {
    this.adminClient = adminClient;
    this.baseUrl = baseUrl;
  }

  async handleAccountDeletedWebhook(account: Account) {
    const logger = await getLogger();

    const ctx = {
      accountId: account.id,
      namespace: this.namespace,
    };

    logger.info(ctx, 'Received account deleted webhook. Processing...');

    if (account.is_personal_account) {
      logger.info(ctx, `Account is personal. We send an email to the user.`);

      await this.sendDeleteAccountEmail(account);
    }
  }

  async handleSubscriptionUpdatedWebhook(
    oldAccount: Account | null,
    newAccount: Account,
  ) {
    // validate if is personal account
    const logger = await getLogger();
    const ctx = {
      accountId: newAccount.id,
      namespace: this.namespace,
    };

    if (!newAccount.is_personal_account) {
      logger.info(ctx, `Account is not personal. We do nothing.`);
      return;
    }

    if (!newAccount.organization_id) {
      logger.info(ctx, `Account no have organization. We do nothing.`);
      return;
    }

    const isNewOrganizationAssignment =
      !oldAccount?.organization_id && newAccount.organization_id;

    if (!newAccount.deleted_on && !isNewOrganizationAssignment) {
      logger.info(
        ctx,
        `Account is not deleted and is not a new organization assignment. We do nothing.`,
      );
      return;
    }

    // get role of the user
    const rolesToEdit = new Set(['agency_member', 'agency_project_manager']);
    const role =
      (await getUserRoleById(newAccount.id, true, this.adminClient)) ?? '';

    if (!rolesToEdit.has(role)) {
      logger.info(
        ctx,
        `User role is not in the list of roles to edit. We do nothing.`,
      );
      return;
    }

    // get primary owner user id from account
    const primaryOwnerId = await getPrimaryOwnerId(
      this.adminClient,
      newAccount.id,
      newAccount.organization_id ?? '',
    );

    if (!primaryOwnerId) {
      logger.info(ctx, `Primary owner not found. We do nothing.`);
      return;
    }

    // get subscription
    const subscription = await getSubscriptionByPropietaryOrganizationId(
      primaryOwnerId,
      this.adminClient,
    );

    if (!subscription) {
      logger.info(ctx, `Subscription not found. We do nothing.`);
      return;
    }

    // get count members
    let countMembers = 0;
    const { data: members, error: membersError } = await this.adminClient
      .from('accounts')
      .select('id')
      .eq('organization_id', newAccount.organization_id ?? '')
      .is('deleted_on', null);

    if (membersError) {
      logger.error(ctx, `Error getting members: ${membersError.message}`);
      return;
    }

    countMembers = members?.length ?? 0;

    // get stripe subscription
    const responseGetSubscription = await fetch(
      `${this.baseUrl}/api/stripe/get-subscription?subscriptionId=${encodeURIComponent(subscription?.id ?? '')}`,
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
    const dataSubscription = await responseGetSubscription.clone().json();
    // update subscription in stripe
    const responseUpdateSubscription = await fetch(
      `${this.baseUrl}/api/stripe/update-subscription?subscriptionId=${encodeURIComponent(subscription?.id ?? '')}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemQuantity: countMembers ?? 0,
          itemId: dataSubscription?.items.data[0]?.id,
          priceId: dataSubscription?.items.data[0]?.price.id,
        }),
      },
    );
    if (!responseUpdateSubscription.ok) {
      throw new Error('Failed to update subscription');
    }
  }

  private async sendDeleteAccountEmail(account: Account) {
    const userEmail = account.email;
    const userDisplayName = account.name ?? userEmail;

    const emailSettings = this.getEmailSettings();

    if (userEmail) {
      await this.sendAccountDeletionEmail({
        fromEmail: emailSettings.fromEmail,
        productName: emailSettings.productName,
        userDisplayName,
        userEmail,
      });
    }
  }

  private async sendAccountDeletionEmail(params: {
    fromEmail: string;
    userEmail: string;
    userDisplayName: string;
    productName: string;
  }) {
    const { renderAccountDeleteEmail } = await import('@kit/email-templates');
    const { getMailer } = await import('@kit/mailers');
    const mailer = await getMailer();

    const { html, subject } = await renderAccountDeleteEmail({
      userDisplayName: params.userDisplayName,
      productName: params.productName,
    });

    return mailer.sendEmail({
      to: params.userEmail,
      from: params.fromEmail,
      subject,
      html,
    });
  }

  private getEmailSettings() {
    const productName = process.env.NEXT_PUBLIC_PRODUCT_NAME;
    const fromEmail = process.env.EMAIL_SENDER;

    return z
      .object({
        productName: z.string(),
        fromEmail: z.string().email(),
      })
      .parse({
        productName,
        fromEmail,
      });
  }
}