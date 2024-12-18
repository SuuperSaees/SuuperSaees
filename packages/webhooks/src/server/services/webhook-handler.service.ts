import 'server-only';

import { getSupabaseRouteHandlerClient } from '@kit/supabase/route-handler-client';

import { createWebhookRouterService } from './webhook-router.service';

/**
 * @name DatabaseChangePayload
 * @description Payload for the database change event. Useful for handling custom webhooks.
 */

export function getWebhookHandlerService(): WebhookHandlerService {
  return new WebhookHandlerService();
}

/**
 * @name getDatabaseWebhookHandlerService
 * @description Get the database webhook handler service
 */
class WebhookHandlerService {
  private readonly namespace = 'webhook-handler';

  /**
   * @name handleWebhook
   * @description Handle the webhook event
   * @param request
   * @param params
   */
  async handleWebhook(request: Request) {
    // create a client with admin access since we are handling webhooks
    // and no user is authenticated

    const client = getSupabaseRouteHandlerClient({
      admin: true,
    });
    // handle the webhook
    const service = createWebhookRouterService(client);

    try {
      await service.handleWebhookWithRequest(request);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}