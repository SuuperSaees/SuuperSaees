import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';

import { createClient } from '../../../../features/team-accounts/src/server/actions/clients/create/create-clients';
import { insertServiceToClient } from '../../../../features/team-accounts/src/server/actions/services/create/create-service';

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

    const stripeAccountId = event.account;

    await service.handleWebhookEvent(event, {
      onCheckoutSessionCompleted: async (data) => {
        if (stripeAccountId) {
          // TODO: Implement logic to handle checkout session completed

          // Search organization by accountId
          const { data: organizationData, error: organizationError } =
            await this.adminClient
              .from('accounts')
              .select('id, organization_id')
              .eq('stripe_id', stripeAccountId)
              .single();

          if (organizationError) {
            console.error('Error fetching organization:', organizationError);
            throw organizationError;
          }

          const newClient = {
            email: data?.customer_details?.email, // TODO: Check if this is the correct field
            slug: `${data?.customer_details?.name}'s Organization`,
            name: data?.customer_details?.name, // TODO: Check if this is the correct field
          };
          const createdBy = organizationData?.id;
          const agencyId = organizationData?.organization_id;

          const client = await createClient({
            client: newClient,
            role: this.ClientRoleStripeInvitation,
            agencyId: agencyId ?? '',
            adminActivated: true,
          });

          console.log('client', client, createdBy);

          console.log('checkout session id', data?.object?.id, data);
          // After assign a service to the client, we need to create the subscription
          // Search in the database, by checkout session id
          
          await insertServiceToClient(
            this.adminClient,
            client.organization_client_id ?? '',
            2, // TODO: Get the service id from the database
            client.id ?? '',
            createdBy ?? '',
            agencyId ?? '',
          );
          
          console.log('Subscription created');
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