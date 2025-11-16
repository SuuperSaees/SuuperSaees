import { SupabaseClient } from '@supabase/supabase-js';



import { getLogger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';



import { RecordChange, Tables } from '../record-change.type';


export function createDatabaseWebhookRouterService(
  adminClient: SupabaseClient<Database>,
) {
  return new DatabaseWebhookRouterService(adminClient);
}

/**
 * @name DatabaseWebhookRouterService
 * @description Service that routes the webhook event to the appropriate service
 */
class DatabaseWebhookRouterService {
  constructor(private readonly adminClient: SupabaseClient<Database>) {}

  /**
   * @name handleWebhook
   * @description Handle the webhook event
   * @param body
   */
  async handleWebhook(body: RecordChange<keyof Tables>) {
    switch (body.table) {
      case 'invitations': {
        const payload = body as RecordChange<typeof body.table>;

        return this.handleInvitationsWebhook(payload);
      }

      case 'services': {
        const payload = body as RecordChange<typeof body.table>;

        return this.handleServicesWebhook(payload);
      }

      case 'billing_accounts': {
        const payload = body as RecordChange<typeof body.table>;

        return this.handleBillingAccountsWebhook(payload);
      }

      case 'checkouts': {
        const payload = body as RecordChange<typeof body.table>;

        return this.handleCheckoutsWebhook(payload);
      }

      case 'accounts': {
        const payload = body as RecordChange<typeof body.table>;

        return this.handleAccountsWebhook(payload);
      }

      default: {
        return;
      }
    }
  }

  private async handleServicesWebhook(body: RecordChange<'services'>) {
    const logger = await getLogger();
    const { createBillingWebhooksService } = await import(
      '@kit/billing-gateway'
    );
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''; // if this baseUrl fail, use getDomainByUserId function

    if (body.type === 'INSERT' && body.record) {
      const service = createBillingWebhooksService(this.adminClient, baseUrl);
      logger.info(body, 'Handling services webhook');
      return service.handleServiceCreatedWebhook(body.record);
    }

    if (body.type === 'UPDATE' && body.record) {
      const service = createBillingWebhooksService(this.adminClient, baseUrl);
      logger.info(body, 'Handling services webhook');
      return service.handleServiceUpdatedWebhook(body.record, body.old_record ?? undefined);
    }

    if (body.type === 'DELETE' && body.old_record) {
      logger.info(body, 'This logic should be implemented');
      return;
    }
  }

  private async handleBillingAccountsWebhook(
    body: RecordChange<'billing_accounts'>,
  ) {
    const logger = await getLogger();
    const { createBillingWebhooksService } = await import(
      '@kit/billing-gateway'
    );
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''; // if this baseUrl fail, use getDomainByUserId function
    const service = createBillingWebhooksService(this.adminClient, baseUrl);
    logger.info(body, 'Handling billing accounts webhook');
    return service.handleBillingAccountCreatedWebhook(body.record);
  }

  private async handleInvitationsWebhook(body: RecordChange<'invitations'>) {
    const { createAccountInvitationsWebhookService } = await import(
      '@kit/team-accounts/webhooks'
    );

    const service = createAccountInvitationsWebhookService(this.adminClient);

    return service.handleInvitationWebhook(body.record);
  }

  // private async handleSubscriptionsWebhook(
  //   body: RecordChange<'subscriptions'>,
  // ) {
  //   if (body.type === 'DELETE' && body.old_record) {
  //     const { createBillingWebhooksService } = await import(
  //       '@kit/billing-gateway'
  //     );

  //     const service = createBillingWebhooksService();

  //     return service.handleSubscriptionDeletedWebhook(body.old_record);
  //   }
  // }

  private async handleAccountsWebhook(body: RecordChange<'accounts'>) {
    if (body.type === 'DELETE' && body.old_record) {
      const { createAccountWebhooksService } = await import(
        '@kit/team-accounts/webhooks'
      );
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''; // if this baseUrl fail, use getDomainByUserId function
      const service = createAccountWebhooksService(this.adminClient, baseUrl);

      return service.handleAccountDeletedWebhook(body.old_record);
    }

    if (body.type === 'UPDATE' && body.record) {
      const { createAccountWebhooksService } = await import(
        '@kit/team-accounts/webhooks'
      );
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''; // if this baseUrl fail, use getDomainByUserId function
      const service = createAccountWebhooksService(this.adminClient, baseUrl);

      return service.handleSubscriptionUpdatedWebhook(
        body.old_record,
        body.record,
      );
    }
  }

  private async handleCheckoutsWebhook(body: RecordChange<'checkouts'>) {
    const logger = await getLogger();
    const { createBillingWebhooksService } = await import(
      '@kit/billing-gateway'
    );
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';

    if (body.type === 'INSERT' && body.record) {
      const service = createBillingWebhooksService(this.adminClient, baseUrl);
      logger.info(body, 'Handling checkouts webhook');
      return service.handleCheckoutCreatedWebhook(body.record);
    }

    return;
  }
}

// Here manage the cancel subscription and update subscription of upgrade