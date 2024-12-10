// import type { Stripe } from 'stripe';
import { z } from 'zod';

import { CreateBillingPortalSessionSchema } from '@kit/billing/schema';
import { getLogger } from '@kit/shared/logger';

/**
 * @name createStripeBillingPortalSession
 * @description Create a Stripe billing portal session for a user
 */
export async function createTreliBillingPortalSession(
  // stripe: Stripe,
  params: z.infer<typeof CreateBillingPortalSessionSchema>,
) {
  const logger = await getLogger();
  const ctx = {
    params,
  };
  logger.info(ctx, 'createTreliBillingPortalSession');
  await Promise.resolve();
  // return stripe.billingPortal.sessions.create({
  //   customer: params.customerId,
  //   return_url: params.returnUrl,
  // });
  return {
    url: '',
  };
}
