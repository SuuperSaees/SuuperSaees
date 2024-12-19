'use server';

import { redirect } from 'next/navigation';

import { enhanceAction } from '@kit/next/actions';
import { getLogger } from '@kit/shared/logger';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';
import { BillingAccounts } from '../../../../../../apps/web/lib/billing-accounts.types';
import { UpdateTeamStripeIdSchema, UpdateTeamNameSchema } from '../../schema/update-team-name.schema';

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

    // select the account by id
    const { data: billingAccount, error: billingAccountError } = await client
      .from('billing_accounts')
      .select('*')
      .eq('account_id', id )
      .single();

    if (billingAccountError && billingAccount) {
      logger.error({ billingAccountError }, `Failed to update stripe id`);
      throw billingAccountError;
    }

    // update the billing account with the stripe id or create a new one if it doesn't exist
    if (!billingAccount) {
      const {error: newBillingAccountError } = await client
        .from('billing_accounts')
        .insert({ 
          account_id: id,
          provider: BillingAccounts.BillingProviderKeys.STRIPE,
          provider_id: stripe_id,
          namespace: 'production',
          credentials: {
            stripe_id: stripe_id
          }
        })

      if (newBillingAccountError) {
        logger.error({ newBillingAccountError }, `Failed to create billing account`);
        throw newBillingAccountError;
      }
    } else {
      const { error: updatedBillingAccountError } = await client
        .from('billing_accounts')
        .update({ provider_id: stripe_id })
        .eq('account_id', id)

      if (updatedBillingAccountError) {
        logger.error({ updatedBillingAccountError }, `Failed to update stripe id`);
        throw updatedBillingAccountError;
      }
    }

    logger.info(`Account stripe id updated`);

    return { success: true };
  },
  {
    schema: UpdateTeamStripeIdSchema,
  },
);
