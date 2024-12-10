'use server';

import { redirect } from 'next/navigation';



import { enhanceAction } from '@kit/next/actions';
import { getLogger } from '@kit/shared/logger';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';



import { UpdateTeamNameSchema, UpdateTeamStripeIdSchema } from '../../schema/update-team-name.schema';


export const updateTeamAccountName = enhanceAction(
  async (params) => {
    const client = getSupabaseServerActionClient();
    const logger = await getLogger();
    const { name, path, slug } = params;

    const ctx = {
      name: 'team-accounts.update',
      accountName: name,
    };

    logger.info(ctx, `Updating team name...`);

    const { error, data } = await client
      .from('accounts')
      .update({
        name,
        slug,
      })
      .match({
        slug,
      })
      .select('slug')
      .single();

    if (error) {
      logger.error({ ...ctx, error }, `Failed to update team name`);

      throw error;
    }

    const newSlug = data.slug;

    logger.info(ctx, `Team name updated`);

    if (newSlug) {
      const nextPath = path.replace('[account]', newSlug);

      redirect(nextPath);
    }

    return { success: true };
  },
  {
    schema: UpdateTeamNameSchema,
  },
);

export const updateTeamAccountStripeId = enhanceAction(
  async (params) => {
    const client = getSupabaseServerActionClient();
    const logger = await getLogger();
    const { stripe_id, id } = params;
    const { error } = await client
      .from('accounts')
      .update({
        stripe_id
      })
      .match({
        id,
      })
      .select('slug')
      .single();

    if (error) {
      logger.error({ error }, `Failed to update stripe id`);

      throw error;
    }

    const { error: errorCreateBillingAccount } = await client
      .from('billing_accounts')
      .insert({
        account_id: id,
        provider: 'stripe',
        provider_id: stripe_id,
        credentials: {
          stripe_id,
        },
      });

    if (errorCreateBillingAccount) {
      logger.error(
        { error: errorCreateBillingAccount },
        `Failed to create billing account`,
      );

      throw errorCreateBillingAccount;
    }

    logger.info(`Team name updated`);

    return { success: true };
  },
  {
    schema: UpdateTeamStripeIdSchema,
  },
);