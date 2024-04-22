import { SupabaseClient } from '@supabase/supabase-js';

import { getLogger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

import { RecordChange, Tables } from '../record-change.type';

export class DatabaseWebhookRouterService {
  constructor(private readonly adminClient: SupabaseClient<Database>) {}

  async handleWebhook(body: RecordChange<keyof Tables>) {
    switch (body.table) {
      case 'invitations': {
        const payload = body as RecordChange<typeof body.table>;

        return this.handleInvitationsWebhook(payload);
      }

      case 'subscriptions': {
        const payload = body as RecordChange<typeof body.table>;

        return this.handleSubscriptionsWebhook(payload);
      }

      case 'accounts': {
        const payload = body as RecordChange<typeof body.table>;

        return this.handleAccountsWebhook(payload);
      }

      default: {
        const logger = await getLogger();

        logger.warn(
          {
            table: body.table,
          },
          'No handler found for table',
        );
      }
    }
  }

  private async handleInvitationsWebhook(body: RecordChange<'invitations'>) {
    const { createAccountInvitationsWebhookService } = await import(
      '@kit/team-accounts/webhooks'
    );

    const service = createAccountInvitationsWebhookService(this.adminClient);

    return service.handleInvitationWebhook(body.record);
  }

  private async handleSubscriptionsWebhook(
    body: RecordChange<'subscriptions'>,
  ) {
    if (body.type === 'DELETE' && body.old_record) {
      const { createBillingWebhooksService } = await import(
        '@kit/billing-gateway'
      );

      const service = createBillingWebhooksService();

      return service.handleSubscriptionDeletedWebhook(body.old_record);
    }
  }

  private async handleAccountsWebhook(body: RecordChange<'accounts'>) {
    if (body.type === 'DELETE' && body.old_record) {
      const { createAccountWebhooksService } = await import(
        '@kit/team-accounts/webhooks'
      );

      const service = createAccountWebhooksService();

      return service.handleAccountDeletedWebhook(body.old_record);
    }
  }
}
