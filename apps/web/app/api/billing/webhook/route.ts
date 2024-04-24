import { getBillingEventHandlerService } from '@kit/billing-gateway';
import { getLogger } from '@kit/shared/logger';
import { getSupabaseRouteHandlerClient } from '@kit/supabase/route-handler-client';

import billingConfig from '~/config/billing.config';

/**
 * @description Handle the webhooks from Stripe related to checkouts
 */
export async function POST(request: Request) {
  const provider = billingConfig.provider;
  const logger = await getLogger();

  const ctx = {
    name: 'billing.webhook',
    provider,
  };

  logger.info(ctx, `Received billing webhook. Processing...`);

  const supabaseClientProvider = () =>
    getSupabaseRouteHandlerClient({ admin: true });

  const service = await getBillingEventHandlerService(
    supabaseClientProvider,
    provider,
    billingConfig,
  );

  try {
    await service.handleWebhookEvent(request);

    logger.info(ctx, `Successfully processed billing webhook`);

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error(error);

    logger.error(
      {
        ...ctx,
        error: JSON.stringify(error),
      },
      `Failed to process billing webhook`,
    );

    return new Response('Error', { status: 500 });
  }
}
