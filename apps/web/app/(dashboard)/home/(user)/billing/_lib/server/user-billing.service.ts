import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

import { z } from 'zod';

import { getProductPlanPair } from '@kit/billing';
import { getBillingGatewayProvider } from '@kit/billing-gateway';
import { getLogger } from '@kit/shared/logger';
import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import appConfig from '~/config/app.config';
import billingConfig from '~/config/billing.config';
import pathsConfig from '~/config/paths.config';
import { Database } from '~/lib/database.types';

import { PersonalAccountCheckoutSchema } from '../schema/personal-account-checkout.schema';

export class UserBillingService {
  private readonly namespace = 'billing.personal-account';

  constructor(private readonly client: SupabaseClient<Database>) {}

  async createCheckoutSession({
    planId,
    productId,
  }: z.infer<typeof PersonalAccountCheckoutSchema>) {
    // get the authenticated user
    const { data: user, error } = await requireUser(this.client);

    if (error ?? !user) {
      throw new Error('Authentication required');
    }

    const service = await getBillingGatewayProvider(this.client);

    // in the case of personal accounts
    // the account ID is the same as the user ID
    const accountId = user.id;

    // the return URL for the checkout session
    const returnUrl = getCheckoutSessionReturnUrl();

    // find the customer ID for the account if it exists
    // (eg. if the account has been billed before)
    const customerId = await getCustomerIdFromAccountId(accountId);

    const product = billingConfig.products.find(
      (item) => item.id === productId,
    );

    if (!product) {
      throw new Error('Product not found');
    }

    const { plan } = getProductPlanPair(billingConfig, planId);
    const logger = await getLogger();

    logger.info(
      {
        name: `billing.personal-account`,
        planId,
        customerId,
        accountId,
      },
      `User requested a personal account checkout session. Contacting provider...`,
    );

    try {
      // call the payment gateway to create the checkout session
      const { checkoutToken } = await service.createCheckoutSession({
        returnUrl,
        accountId,
        customerEmail: user.email,
        customerId,
        plan,
        variantQuantities: [],
        enableDiscountField: product.enableDiscountField,
      });

      logger.info(
        {
          userId: user.id,
        },
        `Checkout session created. Returning checkout token to client...`,
      );

      // return the checkout token to the client
      // so we can call the payment gateway to complete the checkout
      return {
        checkoutToken,
      };
    } catch (error) {
      logger.error(
        {
          name: `billing.personal-account`,
          planId,
          customerId,
          accountId,
          error,
        },
        `Checkout session not created due to an error`,
      );

      throw new Error(`Failed to create a checkout session`);
    }
  }

  async createBillingPortalSession() {
    const { data, error } = await requireUser(this.client);

    if (error ?? !data) {
      throw new Error('Authentication required');
    }

    const service = await getBillingGatewayProvider(this.client);
    const logger = await getLogger();

    const accountId = data.id;
    const customerId = await getCustomerIdFromAccountId(accountId);
    const returnUrl = getBillingPortalReturnUrl();

    if (!customerId) {
      throw new Error('Customer not found');
    }

    const ctx = {
      name: this.namespace,
      customerId,
      accountId,
    };

    logger.info(
      ctx,
      `User requested a Billing Portal session. Contacting provider...`,
    );

    let url: string;

    try {
      const session = await service.createBillingPortalSession({
        customerId,
        returnUrl,
      });

      url = session.url;
    } catch (error) {
      logger.error(
        {
          error,
          ...ctx,
        },
        `Failed to create a Billing Portal session`,
      );

      throw new Error(
        `Encountered an error creating the Billing Portal session`,
      );
    }

    logger.info(ctx, `Session successfully created.`);

    // redirect user to billing portal
    return url;
  }
}

async function getCustomerIdFromAccountId(accountId: string) {
  const client = getSupabaseServerActionClient();
  const logger = await getLogger();

  logger.info(
    {
      accountId,
    },
    `Getting customer ID for account ${accountId}...`,
  );

  const { data, error } = await client
    .from('billing_customers')
    .select('customer_id')
    .eq('account_id', accountId)
    .maybeSingle();

  if (error) {
    logger.error(
      {
        accountId,
        error,
      },
      `Failed to get customer ID`,
    );

    throw error;
  }

  return data?.customer_id;
}

function getCheckoutSessionReturnUrl() {
  return new URL(
    pathsConfig.app.personalAccountBillingReturn,
    appConfig.url,
  ).toString();
}

function getBillingPortalReturnUrl() {
  return new URL(
    pathsConfig.app.personalAccountBilling,
    appConfig.url,
  ).toString();
}
