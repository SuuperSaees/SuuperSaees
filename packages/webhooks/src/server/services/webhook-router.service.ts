import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@kit/supabase/database';
import { StripeEventHandlersService } from './stripe/stripe-event-handlers.service';
import { TreliWebhookService } from './treli/treli-webhook.service';

export function createWebhookRouterService(
  adminClient: SupabaseClient<Database>,
) {
  return new WebhookRouterService(adminClient);
}

/**
 * @name WebhookRouterService
 * @description Service that routes the webhook event to the appropriate service
 * @param adminClient
 */
class WebhookRouterService {
  private readonly stripeEventHandlers: StripeEventHandlersService;
  private readonly treliWebhookService: TreliWebhookService;

  constructor(private readonly adminClient: SupabaseClient<Database>) {
    this.stripeEventHandlers = new StripeEventHandlersService(adminClient);
    this.treliWebhookService = new TreliWebhookService(adminClient);
  }
  
  /**
   * @name handleWebhookWithRequest
   * @description Handle the webhook event
   * @param request
   */
  async handleWebhookWithRequest(request: Request) {
    const stripeSignature = request.headers.get('stripe-signature');
    const treliSignature = request.headers.get('treli-signature');
    
    if (stripeSignature) {
      const body = await request.text();
      await this.handleStripeWebhook(body, stripeSignature);
    } else if (treliSignature) {
      const body = await request.text();
      const parsedBody = JSON.parse(body);
      await this.treliWebhookService.handleTreliWebhook(parsedBody, treliSignature);
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
        console.log('onCheckoutSessionCompleted', data);
        return await Promise.resolve();
      },
      
      onSubscriptionUpdated: async (data) => {
        console.log('Subscription updated:', data);
        await this.stripeEventHandlers.handleSubscriptionUpdated(data);
        return Promise.resolve();
      },
      
      onSubscriptionDeleted: async (subscriptionId) => {
        console.log('Subscription deleted:', subscriptionId);
        await this.stripeEventHandlers.handleSubscriptionDeleted(subscriptionId);
        return Promise.resolve();
      },
      
      onPaymentSucceeded: async (sessionId) => {
        console.log('Payment succeeded:', sessionId);
        return Promise.resolve();
      },
      
      onPaymentIntentSucceeded: async (data) => {
        console.log('onPaymentIntentSucceeded', data);
        try {
          await this.stripeEventHandlers.handlePaymentIntentSucceeded(data, stripeAccountId ?? '');
        } catch (error) {
          console.error('Error handling payment intent succeeded:', error);
        }
      },
      
      onPaymentFailed: async (sessionId) => {
        console.log('Payment failed:', sessionId);
        return Promise.resolve();
      },
      
      onInvoicePaid: async (data) => {
        await this.stripeEventHandlers.handleInvoicePayment(data);
        return Promise.resolve();
      },

      onInvoiceCreated: async (data) => {
        console.log('Invoice created:', data);
        await this.stripeEventHandlers.handleInvoiceCreated(event, stripeAccountId);
        return Promise.resolve();
      },

      onInvoiceUpdated: async (data) => {
        console.log('Invoice updated:', data);
        await this.stripeEventHandlers.handleInvoiceUpdated(data);
        return Promise.resolve();
      },
      
      onEvent: async (event) => {
        console.log('Processing event:', event.type);

        if (event.type === 'customer.subscription.created') {
          await this.stripeEventHandlers.handleSubscriptionCreated(event, stripeAccountId);
        }
        
        return Promise.resolve();
      },
    });
  }
}