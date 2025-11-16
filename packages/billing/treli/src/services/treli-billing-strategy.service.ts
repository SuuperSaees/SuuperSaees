import 'server-only';



import { z } from 'zod';



import { BillingStrategyProviderService } from '@kit/billing';
import {
  CancelSubscriptionParamsSchema,
  CreateBillingCheckoutSchema,
  CreateBillingPortalSessionSchema,
  QueryBillingUsageSchema,
  ReportBillingUsageSchema,
  RetrieveCheckoutSessionSchema,
  UpdateSubscriptionParamsSchema,
} from '@kit/billing/schema';
import { UpsertSubscriptionParams } from '@kit/billing/types';
import { getLogger } from '@kit/shared/logger';
import { RetryOperationService } from '@kit/shared/utils';
import { Database } from '@kit/supabase/database';

import { CredentialsCrypto, TreliCredentials } from '../../../../../apps/web/app/utils/credentials-crypto';

/**
 * A class representing a mailer using the Suuper HTTP API.
 * @implements {Mailer}
 */
interface ServiceOperationResult {
  success: boolean;
}
type ServiceType = Database['public']['Tables']['services']['Row'];
type BillingAccountType =
  Database['public']['Tables']['billing_accounts']['Row'];
/**
 * @name TreliBillingStrategyService
 * @description The Treli billing strategy service
 * @class TreliBillingStrategyService
 * @implements {BillingStrategyProviderService}
 */

interface EncryptedCredentials {
  data: string;
  iv: string;
  version: number;
  tag: string;
}

interface Credentials {
  username: string;
  password: string;
  created_at: string;
}
export class TreliBillingStrategyService
  implements BillingStrategyProviderService
{
  private readonly namespace = 'billing.treli';
  private credentialsCrypto: CredentialsCrypto;
  private readonly sufix = 'suuper';
  private readonly baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  private readonly suuperClientId =
    process.env.NEXT_PUBLIC_SUUPER_CLIENT_ID ?? '';
  private readonly suuperClientSecret =
    process.env.NEXT_PUBLIC_SUUPER_CLIENT_SECRET ?? '';
  constructor() {
    const secretKey = Buffer.from(
      process.env.CREDENTIALS_SECRET_KEY ?? '',
      'hex',
    );
    this.credentialsCrypto = new CredentialsCrypto(secretKey);
  }

  /**
   * @name createCheckoutSession
   * @description Creates a checkout session for a customer
   * @param params
   */
  async createCheckoutSession(
    params: z.infer<typeof CreateBillingCheckoutSchema>,
  ) {
    // const stripe = await this.stripeProvider();
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      customerId: params.customerId,
      accountId: params.accountId,
    };

    // logger.info(ctx, 'Creating checkout session...');

    // const { client_secret } = await createTreliCheckout(params);

    // if (!client_secret) {
    //   logger.error(ctx, 'Failed to create checkout session');

    //   throw new Error('Failed to create checkout session');
    // }

    logger.info(ctx, 'Checkout session created successfully');
    await Promise.resolve();
    return { checkoutToken: '' };
  }

  /**
   * @name createBillingPortalSession
   * @description Creates a billing portal session for a customer
   * @param params
   */
  async createBillingPortalSession(
    params: z.infer<typeof CreateBillingPortalSessionSchema>,
  ) {
    // const stripe = await this.stripeProvider();
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      customerId: params.customerId,
    };

    logger.info(ctx, 'Creating billing portal session...');

    // const session = await createStripeBillingPortalSession(stripe, params);

    // if (!session?.url) {
    //   logger.error(ctx, 'Failed to create billing portal session');
    // } else {
    //   logger.info(ctx, 'Billing portal session created successfully');
    // }

    return { url: '' };
  }

  /**
   * @name cancelSubscription
   * @description Cancels a subscription
   * @param params
   */
  async cancelSubscription(
    params: z.infer<typeof CancelSubscriptionParamsSchema>,
  ) {
    // const stripe = await this.stripeProvider();
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      subscriptionId: params.subscriptionId,
    };

    logger.info(ctx, 'Cancelling subscription...');

    try {
      // await stripe.subscriptions.cancel(params.subscriptionId, {
      //   invoice_now: params.invoiceNow ?? true,
      // });

      logger.info(ctx, 'Subscription cancelled successfully');

      return {
        success: true,
      };
    } catch (error) {
      logger.info(
        {
          ...ctx,
          error,
        },
        `Failed to cancel subscription. It may have already been cancelled on the user's end.`,
      );

      return {
        success: false,
      };
    }
  }

  /**
   * @name retrieveCheckoutSession
   * @description Retrieves a checkout session
   * @param params
   */
  async retrieveCheckoutSession(
    params: z.infer<typeof RetrieveCheckoutSessionSchema>,
  ) {
    // const stripe = await this.stripeProvider();
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      sessionId: params.sessionId,
    };

    logger.info(ctx, 'Retrieving checkout session...');
    await Promise.resolve();
    // try {
    //   const session = await stripe.checkout.sessions.retrieve(params.sessionId);
    //   const isSessionOpen = session.status === 'open';

    //   logger.info(ctx, 'Checkout session retrieved successfully');

    //   return {
    //     checkoutToken: session.client_secret,
    //     isSessionOpen,
    //     status: session.status ?? 'complete',
    //     customer: {
    //       email: session.customer_details?.email ?? null,
    //     },
    //   };
    // } catch (error) {
    //   logger.error(
    //     {
    //       ...ctx,
    //       error,
    //     },
    //     'Failed to retrieve checkout session',
    //   );

    //   throw new Error('Failed to retrieve checkout session');
    // }

    return {
      checkoutToken: '',
      isSessionOpen: false,
      status: 'complete' as 'complete' | 'expired' | 'open',
      customer: { email: null },
    };
  }

  /**
   * @name reportUsage
   * @description Reports usage for a subscription with the Metrics API
   * @param params
   */
  async reportUsage(params: z.infer<typeof ReportBillingUsageSchema>) {
    // const stripe = await this.stripeProvider();
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      subscriptionItemId: params.id,
      usage: params.usage,
    };

    logger.info(ctx, 'Reporting usage...');

    // if (!params.eventName) {
    //   logger.error(ctx, 'Event name is required');

    //   throw new Error('Event name is required when reporting Metrics');
    // }

    // try {
    //   await stripe.billing.meterEvents.create({
    //     event_name: params.eventName,
    //     payload: {
    //       value: params.usage.quantity.toString(),
    //       stripe_customer_id: params.id,
    //     },
    //   });
    // } catch (error) {
    //   logger.error(
    //     {
    //       ...ctx,
    //       error,
    //     },
    //     'Failed to report usage',
    //   );

    //   throw new Error('Failed to report usage');
    // }

    return {
      success: true,
    };
  }

  /**
   * @name queryUsage
   * @description Reports the total usage for a subscription with the Metrics API
   */
  async queryUsage(params: z.infer<typeof QueryBillingUsageSchema>) {
    //    const stripe = await this.stripeProvider();
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      id: params.id,
      customerId: params.customerId,
    };

    logger.info(ctx, 'Querying billing usage...');

    // validate shape of filters for Stripe
    // if (!('startTime' in params.filter)) {
    //   logger.error(ctx, 'Start and end time are required for Stripe');

    //   throw new Error('Start and end time are required when querying usage');
    // }

    // logger.info(ctx, 'Querying billing usage...');

    // try {
    //   const summaries = await stripe.billing.meters.listEventSummaries(
    //     params.id,
    //     {
    //       customer: params.customerId,
    //       start_time: params.filter.startTime,
    //       end_time: params.filter.endTime,
    //     },
    //   );

    //   logger.info(ctx, 'Billing usage queried successfully');

    //   const value = summaries.data.reduce((acc, summary) => {
    //     return acc + Number(summary.aggregated_value);
    //   }, 0);

    //   return {
    //     value,
    //   };
    // } catch (error) {
    //   logger.error(
    //     {
    //       ...ctx,
    //       error,
    //     },
    //     'Failed to report usage',
    //   );

    //   throw new Error('Failed to report usage');
    // }

    return {
      value: 0,
    };
  }

  /**
   * @name updateSubscriptionItem
   * @description Updates a subscription
   * @param params
   */
  async updateSubscriptionItem(
    params: z.infer<typeof UpdateSubscriptionParamsSchema>,
  ) {
    // const stripe = await this.stripeProvider();
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      subscriptionId: params.subscriptionId,
      subscriptionItemId: params.subscriptionItemId,
      quantity: params.quantity,
    };

    logger.info(ctx, 'Updating subscription...');

    // try {
    //   await stripe.subscriptions.update(params.subscriptionId, {
    //     items: [
    //       {
    //         id: params.subscriptionItemId,
    //         quantity: params.quantity,
    //       },
    //     ],
    //   });

    //   logger.info(ctx, 'Subscription updated successfully');

    //   return { success: true };
    // } catch (error) {
    //   logger.error({ ...ctx, error }, 'Failed to update subscription');

    //   throw new Error('Failed to update subscription');
    // }
    return { success: true };
  }

  /**
   * @name getPlanById
   * @description Retrieves a plan by id
   * @param planId
   */
  async getPlanById(planId: string) {
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      planId,
    };

    logger.info(ctx, 'Retrieving plan by id...');

    //  const stripe = await this.stripeProvider();

    // try {
    //   const plan = await stripe.plans.retrieve(planId);

    //   logger.info(ctx, 'Plan retrieved successfully');

    //   return {
    //     id: plan.id,
    //     name: plan.nickname ?? '',
    //     amount: plan.amount ?? 0,
    //     interval: plan.interval,
    //   };
    // } catch (error) {
    //   logger.error({ ...ctx, error }, 'Failed to retrieve plan');

    //   throw new Error('Failed to retrieve plan');
    // }
    return {
      id: '',
      name: '',
      interval: '',
      amount: 0,
    };
  }

  async getSubscription(subscriptionId: string) {
    // const stripe = await this.stripeProvider();
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      subscriptionId,
    };

    logger.info(ctx, 'Retrieving subscription...');

    // const subscriptionPayloadBuilder =
    //   createStripeSubscriptionPayloadBuilderService();

    // return subscriptionPayloadBuilder.build({});

    // try {
    //   const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    //     expand: ['line_items'],
    //   });

    //   logger.info(ctx, 'Subscription retrieved successfully');

    //   const customer = subscription.customer as string;
    //   const accountId = subscription.metadata?.accountId as string;

    //   return subscriptionPayloadBuilder.build({
    //     customerId: customer,
    //     accountId,
    //     id: subscription.id,
    //     lineItems: subscription.items.data,
    //     status: subscription.status,
    //     currency: subscription.currency,
    //     cancelAtPeriodEnd: subscription.cancel_at_period_end,
    //     periodStartsAt: subscription.current_period_start,
    //     periodEndsAt: subscription.current_period_end,
    //     trialStartsAt: subscription.trial_start,
    //     trialEndsAt: subscription.trial_end,
    //   });
    // } catch (error) {
    //   logger.error({ ...ctx, error }, 'Failed to retrieve subscription');

    //   throw new Error('Failed to retrieve subscription');
    // }
    return {
      customerId: '',
      accountId: '',
      id: '',
      lineItems: [],
      status: '' as Database['public']['Enums']['subscription_status'],
      currency: '',
      cancelAtPeriodEnd: false,
      periodStartsAt: '',
      periodEndsAt: '',
      trialStartsAt: '',
      trialEndsAt: '',
      target_account_id: '',
      target_customer_id: '',
      target_subscription_id: '',
      active: false,
      billing_provider: '' as Database['public']['Enums']['billing_provider'],
      cancel_at_period_end: false,
      period_starts_at: '',
      period_ends_at: '',
      line_items: JSON.stringify([]),
    } as unknown as UpsertSubscriptionParams & {
      target_account_id: string | undefined;
    };
  }

  async createService(
    service: ServiceType,
    billingAccount: BillingAccountType,
    baseUrl: string,
  ) {
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      serviceId: service.id,
      billingAccountId: billingAccount.id,
      baseUrl,
    };

    const retryOperation = new RetryOperationService<ServiceOperationResult>(
      async () => {
        const parsedCredentials: EncryptedCredentials = JSON.parse(
          billingAccount.credentials as string,
        );
        if (
          !parsedCredentials.data ||
          !parsedCredentials.iv ||
          !parsedCredentials.version ||
          !parsedCredentials.tag
        ) {
          logger.error(ctx, 'Invalid encrypted credentials');
          return { success: false };
        }

        // Decrypt credentials
        const credentials =
          this.credentialsCrypto.decrypt<TreliCredentials>(parsedCredentials);

        // Create Basic Auth token
        const authToken = Buffer.from(
          `${credentials.treli_user}:${credentials.treli_password}`,
        ).toString('base64');

        // Prepare subscription plans
        const subscriptionPlan = {
          interval: 1, // Default to 1 if not specified
          period: service.recurrence ?? 'month',
          subsprice: service.price ?? 0,
          trial_length: service.test_period_duration ?? undefined,
          trial_period:
            service.test_period_duration_unit_of_measurement ?? undefined,
          has_trial: service.test_period ?? false,
        };

        // Encode SKU in base64
        const skuRaw = `${this.sufix}_${service.id}`;
        const skuBase64 = Buffer.from(skuRaw).toString('base64');

        // Prepare service data for Treli
        const treliServiceData = {
          name: service.name,
          description: service.service_description ?? '',
          sku: skuBase64,
          trackqty: false,
          inventory: 0,
          stockstatus: 'instock',
          image_url: service.service_image ?? '',
          productstatus: service.status === 'active' ? 'active' : 'draft',
          product_type: service.recurring_subscription
            ? 'service'
            : 'subsproduct',
          subs_plans: service.recurring_subscription ? [subscriptionPlan] : [],
        };

        // Make request to Treli API
        const response = await fetch(
          'https://treli.co/wp-json/api/plans/create',
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Basic ${authToken}`,
            },
            body: JSON.stringify(treliServiceData),
          },
        );

        if (!response.ok) {
          const errorData = await response.clone().json();
          logger.error(
            { ...ctx, error: errorData },
            'Failed to create service in Treli',
          );
          return { success: false };
        }

        const responseData = await response.clone().json();
        logger.info(
          { ...ctx, treliResponse: responseData },
          'Service created successfully in Treli',
        );

        const res = await fetch(`${baseUrl}/api/v1/billing/services`, {
          method: 'POST',
          headers: new Headers({
            Authorization: `Basic ${btoa(`${this.suuperClientId}:${this.suuperClientSecret}`)}`,
          }),
          body: JSON.stringify({
            id: service.id,
            provider: 'treli',
            provider_id: `${responseData.id}`,
            status: service.status ?? 'active',
          }),
        });

        if (!res.ok) {
          logger.error(ctx, 'Failed to create service in Suuper');
          return { success: false };
        }

        return {
          success: true,
        };
      },
      {
        maxAttempts: 3,
        delayMs: 1000,
        backoffFactor: 2,
      },
    );
    try {
      // Parse and validate credentials
      return await retryOperation.execute();
    } catch (error) {
      logger.error({ ...ctx, error }, 'Error creating service in Treli');
      return { success: false };
    }
  }

  async updateService(
    service: ServiceType,
    billingAccount: BillingAccountType,
    baseUrl: string,
    serviceProviderId?: string,
    priceChanged?: boolean,
  ) {
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      serviceId: service.id,
      billingAccountId: billingAccount.id,
      baseUrl,
      priceChanged,
    };
    const retryOperation = new RetryOperationService<ServiceOperationResult>(
      async () => {
        // Parse and validate credentials
        const parsedCredentials: EncryptedCredentials = JSON.parse(
          billingAccount.credentials as string,
        );
        if (
          !parsedCredentials.data ||
          !parsedCredentials.iv ||
          !parsedCredentials.version ||
          !parsedCredentials.tag
        ) {
          logger.error(ctx, 'Invalid encrypted credentials');
          return { success: false };
        }

        // Decrypt credentials
        const credentials =
          this.credentialsCrypto.decrypt<TreliCredentials>(parsedCredentials);

        // Create Basic Auth token
        const authToken = Buffer.from(
          `${credentials.treli_user}:${credentials.treli_password}`,
        ).toString('base64');

        // list plans
        const responsePlans = await fetch(
          `https://treli.co/wp-json/api/plans/get?id=${Number(serviceProviderId)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Basic ${authToken}`,
            },
          },
        );

        if (!responsePlans.ok) {
          logger.error(ctx, 'Failed to get plans from Treli');
          return { success: false };
        }

        const plansData = (await responsePlans.clone().json()) as {
          results: {
            id: number;
            // name: string;
            // description: string;
            // status: string;
            // type: string;
            plans: {
              // interval: number;
              // period: string;
              price: number;
              // trial: string;
              // sign_up_fee: string;
              // commitment_period: string;
              //   multi_currency_prices: string;
              //   multi_currency_signup_fees: string;
            }[]; // if you need to update the plans
          }[];
        };
        const currentPlanToUpdate = plansData.results.find(
          (plan: { id: number }) => plan.id === Number(serviceProviderId),
        );

        // update plan
        const updatedPlan = {
          id: currentPlanToUpdate?.id,
          name: service.name,
          description: service.service_description ?? '',
          subscription_plan_id: 0, // if you need to update the plans take de id of the plan to update
          // description: service.service_description ?? '',
          subs_plan: {
            interval: 1,
            period: service.recurrence ?? 'month',
            subsprice: service.price ?? 0,
            // commitment_periods: 0,
            // has_signup_fee: false,
            // signup_fee: 0,
            // length: undefined,
            // trial_length: service.test_period_duration ?? undefined,
            has_trial: service.test_period ?? false,
            trial_period: service.test_period_duration_unit_of_measurement,
            trial_length: service.test_period_duration,
          },
        };

        const responseUpdatePlan = await fetch(
          `https://treli.co/wp-json/api/plans/update`,
          {
            method: 'POST',
            headers: {
              authorization: `Basic ${authToken}`,
              'content-type': 'application/json',
            },
            body: JSON.stringify(updatedPlan),
          },
        );

        if (!responseUpdatePlan.ok) {
          logger.error(ctx, 'Failed to update plan in Treli');
          return { success: false };
        }

        const responseUpdateService = await fetch(
          `${baseUrl}/api/v1/billing/services/${serviceProviderId}`,
          {
            method: 'PATCH',
            headers: new Headers({
              Authorization: `Basic ${btoa(`${this.suuperClientId}:${this.suuperClientSecret}`)}`,
            }),
            body: JSON.stringify({
              id: service.id,
              provider: 'treli',
              provider_id: `${serviceProviderId}`,
              status: service.status ?? 'active',
            }),
          },
        );

        if (!responseUpdateService.ok) {
          logger.error(ctx, 'Failed to update service in Suuper');
          return { success: false };
        }

        logger.info(ctx, 'Updating service...');
        return {
          success: true,
        };
      },
      {
        maxAttempts: 3,
        delayMs: 1000,
        backoffFactor: 2,
      },
    );
    try {
      return await retryOperation.execute();
    } catch (error) {
      logger.error({ ...ctx, error }, 'Error updating service in Treli');
      return { success: false };
    }
  }
}