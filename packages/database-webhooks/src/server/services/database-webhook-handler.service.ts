import 'server-only';

import { getLogger } from '@kit/shared/logger';
import { getSupabaseRouteHandlerClient } from '@kit/supabase/route-handler-client';

import { RecordChange, Tables } from '../record-change.type';
import { DatabaseWebhookRouterService } from './database-webhook-router.service';
import { getDatabaseWebhookVerifier } from './verifier';

export function getDatabaseWebhookHandlerService() {
  return new DatabaseWebhookHandlerService();
}

class DatabaseWebhookHandlerService {
  private readonly namespace = 'database-webhook-handler';

  /**
   * @name handleWebhook
   * @description Handle the webhook event
   * @param request
   */
  async handleWebhook(request: Request) {
    const logger = await getLogger();

    const json = await request.clone().json();
    const { table, type } = json as RecordChange<keyof Tables>;

    const ctx = {
      name: this.namespace,
      table,
      type,
    };

    logger.info(ctx, 'Received webhook from DB. Processing...');

    // check if the signature is valid
    const verifier = await getDatabaseWebhookVerifier();

    await verifier.verifySignatureOrThrow(request);

    // all good, handle the webhook

    // create a client with admin access since we are handling webhooks
    // and no user is authenticated
    const client = getSupabaseRouteHandlerClient({
      admin: true,
    });

    // handle the webhook
    const service = new DatabaseWebhookRouterService(client);

    try {
      // handle the webhook event based on the table
      await service.handleWebhook(json);

      logger.info(ctx, 'Webhook processed successfully');
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        'Failed to process webhook',
      );

      throw error;
    }
  }
}
