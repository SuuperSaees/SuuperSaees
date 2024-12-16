import { BillingConfig, BillingWebhookHandlerService } from '@kit/billing';
// import { getLogger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

import { StripeServerEnvSchema } from '../schema/stripe-server-env.schema';
import { createStripeSubscriptionPayloadBuilderService } from './treli-subscription-payload-builder.service';

type UpsertSubscriptionParams =
  Database['public']['Functions']['upsert_subscription']['Args'] & {
    line_items: Array<LineItem>;
  };

type WebhookEventHandlers = {
  'checkout.session.completed'?: (
    data: UpsertSubscriptionParams | UpsertOrderParams,
  ) => Promise<unknown>;
  'customer.subscription.updated'?: (
    data: UpsertSubscriptionParams,
  ) => Promise<unknown>;
  'customer.subscription.deleted'?: (
    subscriptionId: string,
  ) => Promise<unknown>;
  'checkout.session.async_payment_failed'?: (
    sessionId: string,
  ) => Promise<unknown>;
  'checkout.session.async_payment_succeeded'?: (
    sessionId: string,
  ) => Promise<unknown>;
  'invoice.paid'?: (data: UpsertSubscriptionParams) => Promise<unknown>;
  'customer.subscription.created'?: (
    data: UpsertSubscriptionParams,
  ) => Promise<unknown>;
  'payment_intent.succeeded'?: (
    data: UpsertSubscriptionParams,
  ) => Promise<unknown>;
};

interface LineItem {
  id: string;
  quantity: number;
  subscription_id: string;
  subscription_item_id: string;
  product_id: string;
  variant_id: string;
  price_amount: number | null | undefined;
  interval: string;
  interval_count: number;
  type: 'flat' | 'metered' | 'per_seat' | undefined;
}

type UpsertOrderParams =
  Database['public']['Functions']['upsert_order']['Args'];

export class TreliWebhookHandlerService
  implements BillingWebhookHandlerService
{
  private stripe: Stripe | undefined;

  constructor(private readonly config: BillingConfig) {}
  async verifyWebhookSignature(request: Request): Promise<unknown> {
    const body = await request.text();
    const stripeSignature = request.headers.get('stripe-signature')!;
    return this.verifyWebhookSignatureCustom(body, stripeSignature);
  }

  private readonly provider: Database['public']['Enums']['billing_provider'] =
    'stripe';

  private readonly namespace = 'billing.stripe';

  /**
   * @name verifyWebhookSignature
   * @description Verifies the webhook signature - should throw an error if the signature is invalid
   */
  async verifyWebhookSignatureCustom(body: string, signature: string) {
    const secretKeyEnv = process.env.STRIPE_SECRET_KEY;
    const webhooksSecretEnv = process.env.STRIPE_WEBHOOK_SECRET;
    const connectWebhooksSecretEnv = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;

    const { webhooksSecret, connectWebhooksSecret } =
      StripeServerEnvSchema.parse({
        secretKey: secretKeyEnv,
        webhooksSecret: webhooksSecretEnv,
        connectWebhooksSecret: connectWebhooksSecretEnv,
      });

    const stripe = await this.loadStripe();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhooksSecret);
    } catch (mainError) {
      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          connectWebhooksSecret ?? '',
        );
      } catch (connectError) {
        throw new Error(
          'Webhook signature verification failed for both secrets',
        );
      }
    }
    return event;
  }

  /**
   * @name handleWebhookEvent
   * @description Handle the webhook event from the billing provider
   * @param event
   * @param params
   */

  async handleWebhookEvent(
    event: Stripe.Event,
    params: {
      onCheckoutSessionCompleted: (
        data: UpsertSubscriptionParams | UpsertOrderParams,
      ) => Promise<unknown>;
      onSubscriptionUpdated: (
        data: UpsertSubscriptionParams,
      ) => Promise<unknown>;
      onSubscriptionDeleted: (subscriptionId: string) => Promise<unknown>;
      onPaymentSucceeded: (sessionId: string) => Promise<unknown>;
      onPaymentIntentSucceeded: (
        data: UpsertSubscriptionParams,
      ) => Promise<unknown>;
      onPaymentFailed: (sessionId: string) => Promise<unknown>;
      onInvoicePaid: (data: UpsertSubscriptionParams) => Promise<unknown>;
      onEvent?(event: Stripe.Event): Promise<unknown>;
    },
  ) {
    const handlers: WebhookEventHandlers = {
      'checkout.session.completed': params.onCheckoutSessionCompleted,
      'customer.subscription.updated': params.onSubscriptionUpdated,
      'customer.subscription.deleted': params.onSubscriptionDeleted,
      'checkout.session.async_payment_failed': params.onPaymentFailed,
      'checkout.session.async_payment_succeeded': params.onPaymentSucceeded,
      'invoice.paid': params.onInvoicePaid,
      'customer.subscription.created': params.onPaymentIntentSucceeded,
      'payment_intent.succeeded': params.onPaymentIntentSucceeded,
    };

    const handler = handlers[event.type as keyof WebhookEventHandlers];

    if (handler) {
      const eventData = event.data.object;
      await handler(eventData as never);
    } else if (params.onEvent) {
      await params.onEvent(event);
    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleCheckoutSessionCompleted(
    event: Stripe.CheckoutSessionCompletedEvent,
    onCheckoutCompletedCallback: (
      data: UpsertSubscriptionParams | UpsertOrderParams,
    ) => Promise<unknown>,
  ) {
    const stripe = await this.loadStripe();

    const session = event.data.object;
    const isSubscription = session.mode === 'subscription';

    const accountId = session.client_reference_id!;
    const customerId = session.customer as string;

    // if it's a subscription, we need to retrieve the subscription
    // and build the payload for the subscription
    if (isSubscription) {
      const subscriptionPayloadBuilderService =
        createStripeSubscriptionPayloadBuilderService();

      const subscriptionId = session.subscription as string;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      const payload = subscriptionPayloadBuilderService
        .withBillingConfig(this.config)
        .build({
          accountId,
          customerId,
          id: subscription.id,
          lineItems: subscription.items.data,
          status: subscription.status,
          currency: subscription.currency,
          periodStartsAt: subscription.current_period_start,
          periodEndsAt: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          trialStartsAt: subscription.trial_start,
          trialEndsAt: subscription.trial_end,
        });

      return onCheckoutCompletedCallback(payload);
    } else {
      // if it's a one-time payment, we need to retrieve the session
      const sessionId = event.data.object.id;

      // from the session, we need to retrieve the line items
      const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
        event.data.object.id,
        {
          expand: ['line_items'],
        },
      );

      const lineItems = sessionWithLineItems.line_items?.data ?? [];
      const paymentStatus = sessionWithLineItems.payment_status;
      const status = paymentStatus === 'unpaid' ? 'pending' : 'succeeded';
      const currency = event.data.object.currency as string;

      const payload: UpsertOrderParams = {
        target_account_id: accountId,
        target_customer_id: customerId,
        target_order_id: sessionId,
        billing_provider: this.provider,
        status: status,
        currency: currency,
        total_amount: sessionWithLineItems.amount_total ?? 0,
        line_items: lineItems.map((item) => {
          const price = item.price as Stripe.Price;

          return {
            id: item.id,
            product_id: price.product as string,
            variant_id: price.id,
            price_amount: price.unit_amount,
            quantity: item.quantity,
          };
        }),
      };

      return onCheckoutCompletedCallback(payload);
    }
  }

  private handleAsyncPaymentFailed(
    event: Stripe.CheckoutSessionAsyncPaymentFailedEvent,
    onPaymentFailed: (sessionId: string) => Promise<unknown>,
  ) {
    const sessionId = event.data.object.id;

    return onPaymentFailed(sessionId);
  }

  private handleAsyncPaymentSucceeded(
    event: Stripe.CheckoutSessionAsyncPaymentSucceededEvent,
    onPaymentSucceeded: (sessionId: string) => Promise<unknown>,
  ) {
    const sessionId = event.data.object.id;

    return onPaymentSucceeded(sessionId);
  }

  private handleSubscriptionUpdatedEvent(
    event: Stripe.CustomerSubscriptionUpdatedEvent,
    onSubscriptionUpdatedCallback: (
      subscription: UpsertSubscriptionParams,
    ) => Promise<unknown>,
  ) {
    const subscription = event.data.object;
    const subscriptionId = subscription.id;
    const accountId = subscription.metadata.accountId as string;

    const subscriptionPayloadBuilderService =
      createStripeSubscriptionPayloadBuilderService();

    const payload = subscriptionPayloadBuilderService
      .withBillingConfig(this.config)
      .build({
        customerId: subscription.customer as string,
        id: subscriptionId,
        accountId,
        lineItems: subscription.items.data,
        status: subscription.status,
        currency: subscription.currency,
        periodStartsAt: subscription.current_period_start,
        periodEndsAt: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialStartsAt: subscription.trial_start,
        trialEndsAt: subscription.trial_end,
      });

    return onSubscriptionUpdatedCallback(payload);
  }

  private handleSubscriptionDeletedEvent(
    event: Stripe.CustomerSubscriptionDeletedEvent,
    onSubscriptionDeletedCallback: (subscriptionId: string) => Promise<unknown>,
  ) {
    // Here we don't need to do anything, so we just return the callback

    return onSubscriptionDeletedCallback(event.data.object.id);
  }

  private async handleInvoicePaid(
    event: Stripe.InvoicePaidEvent,
    onInvoicePaid: (data: UpsertSubscriptionParams) => Promise<unknown>,
  ) {
    const stripe = await this.loadStripe();

    const invoice = event.data.object;
    const subscriptionId = invoice.subscription as string;

    // Retrieve the subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Here we need to retrieve the subscription and build the payload
    const accountId = subscription.metadata.accountId as string;

    const subscriptionPayloadBuilderService =
      createStripeSubscriptionPayloadBuilderService();

    const payload = subscriptionPayloadBuilderService
      .withBillingConfig(this.config)
      .build({
        customerId: subscription.customer as string,
        id: subscriptionId,
        accountId,
        lineItems: subscription.items.data,
        status: subscription.status,
        currency: subscription.currency,
        periodStartsAt: subscription.current_period_start,
        periodEndsAt: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialStartsAt: subscription.trial_start,
        trialEndsAt: subscription.trial_end,
      });

    return onInvoicePaid(payload);
  }

  private async loadStripe() {
    if (!this.stripe) {
      this.stripe = await createStripeClient();
    }

    return this.stripe;
  }
}
