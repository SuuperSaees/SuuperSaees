'use server';

import { redirect } from 'next/navigation';

import { enhanceAction } from '@kit/next/actions';
import { getLogger } from '@kit/shared/logger';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { createAccountPlugin } from '../../../../../../apps/web/app/server/actions/account-plugins/account-plugins.action';
import { updateAccountPlugin } from '../../../../../../apps/web/app/server/actions/account-plugins/account-plugins.action';
import {
  UpdateTeamNameSchema,
  UpdateTeamStripeIdSchema,
} from '../../schema/update-team-name.schema';

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
    const { stripe_id, id: accountId } = params;

    const { data: pluginData, error: pluginError } = await client
      .from('plugins')
      .select('id')
      .eq('name', 'stripe')
      .is('deleted_on', null)
      .single();

    if (pluginError) {
      logger.error(
        { pluginError },
        `Failed to fetch plugin_id for stripe in plugins table`,
      );
      throw new Error(`Failed to fetch plugin_id for stripe`);
    }

    const pluginId = pluginData?.id;

    const { data: existingPlugin, error: existingPluginError } = await client
      .from('account_plugins')
      .select('id')
      .eq('account_id', accountId)
      .eq('plugin_id', pluginId)
      .single();

    if (existingPluginError) {
      logger.error(
        { existingPluginError },
        `Error fetching account plugin for account_id: ${accountId}`,
      );
      throw existingPluginError;
    }

    if (!existingPlugin) {
      await createAccountPlugin({
        plugin_id: pluginId,
        account_id: accountId,
        credentials: { stripe_id },
        status: 'installed',
      });

      logger.info(
        `Successfully created account plugin for account_id: ${accountId}`,
      );
    } else {
      const updatedCredentials = { stripe_id };

      await updateAccountPlugin(
        existingPlugin.id,
        {
          credentials: updatedCredentials,
          provider: 'stripe',
          account_id: accountId,
          provider_id: stripe_id,
        },
      );

      logger.info(
        `Successfully updated account plugin for account_id: ${accountId}`,
      );
    }

    logger.info(`Account stripe id updated successfully`);

    return { success: true };
  },
  {
    schema: UpdateTeamStripeIdSchema,
  },
);
