import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';

import { createClient } from '../../../../features/team-accounts/src/server/actions/clients/create/create-clients';

export function createWebhookRouterService(
  adminClient: SupabaseClient<Database>,
) {
  return new WebhookRouterService(adminClient);
}

/**
 * @name WebhookRouterService
 * @description Service that routes the webhook event to the appropriate service
 * @param adminClient
 * @param client
 */
class WebhookRouterService {
  constructor(private readonly adminClient: SupabaseClient<Database>) {}
  private readonly ClientRoleStripeInvitation = 'client_owner';
  /**
   * @name handleWebhookWithRequest
   * @description Handle the webhook event
   * @param request
   */
  async handleWebhookWithRequest(request: Request) {
    const stripeSignature = request.headers.get('stripe-signature')!;
    if (stripeSignature) {
      const body = await request.text();
      await this.handleStripeWebhook(body, stripeSignature);
    }
  }

  private async handleStripeWebhook(body: string, stripeSignature: string) {
    const { StripeWebhookHandlerService } = await import('@kit/stripe');

    const service = new StripeWebhookHandlerService({
      provider: 'stripe' as 'stripe' | 'lemon-squeezy' | 'paddle',
      products: [],
    });

    const event = await service.verifyWebhookSignatureCustom(
      body,
      stripeSignature,
    );

    const accountId = event.account;

    await service.handleWebhookEvent(event, {
      onCheckoutSessionCompleted: async (data) => {
        if (accountId) {
          // TODO: Implement logic to handle checkout session completed

          // Search organization by accountId

          const newClient = {
            email: data?.customer_details?.email, // TODO: Check if this is the correct field
            slug: data?.customer_details?.email, // TODO: Check if this is the correct field
            name: data?.customer_details?.name, // TODO: Check if this is the correct field
          };

          console.log('newClient', newClient);

          // await createClient({
          //   client: newClient,
          //   role: this.ClientRoleStripeInvitation,
          // });

          // After assign a service to the client, we need to create the subscription
        } else {
          // TODO: Implement logic to handle checkout session completed
          console.log('Account ID not found in the event');
        }
        return Promise.resolve();
      },
      onSubscriptionUpdated: async (data) => {
        // No-op or implement logic if needed
        console.log('Subscription updated:', data);
        return Promise.resolve();
      },
      onSubscriptionDeleted: async (subscriptionId) => {
        // No-op or implement logic if needed
        console.log('Subscription deleted:', subscriptionId);
        return Promise.resolve();
      },
      onPaymentSucceeded: async (sessionId) => {
        // No-op or implement logic if needed
        console.log('Payment succeeded:', sessionId);
        return Promise.resolve();
      },
      onPaymentFailed: async (sessionId) => {
        // No-op or implement logic if needed
        console.log('Payment failed:', sessionId);
        return Promise.resolve();
      },
      onInvoicePaid: async (data) => {
        // No-op or implement logic if needed
        console.log('Invoice paid:', data);
        return Promise.resolve();
      },
      onEvent: async (event) => {
        // No-op or implement logic if needed
        console.log('Event:', event);
        return Promise.resolve();
      },
    });
  }
}
