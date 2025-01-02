'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import {
  CustomError,
  CustomResponse,
  ErrorPluginOperations,
} from '../../../../shared/src/response';
import { HttpStatus } from '../../../../shared/src/response/http-status';
import { getPluginsByAccount } from '../services/plugin-services';

/**
 * @name getPluginsByAccountAction
 * @description Server Action to fetch plugins associated with a specific account.
 * Utilizes Supabase for database interactions and manages responses using CustomResponse and CustomError.
 * @param {string} accountId - The ID of the account to fetch plugins for.
 * @param {number} limit - The maximum number of plugins to fetch.
 * @param {number} offset - The offset for pagination.
 * @returns {Promise<Object>} A standardized response containing the plugins data or an error message.
 */

export const getPluginsByAccountAction = async (
  accountId: string,
  limit: number,
  offset: number,
) => {
  try {
    const client =
      getSupabaseServerActionClient() as unknown as SupabaseClient<Database>;

    const plugins = await getPluginsByAccount(client, accountId, limit, offset);

    return CustomResponse.success(plugins, 'pluginsFetched').toJSON();
  } catch (error) {
    console.error('Error getting plugins for account:', error);

    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }

    return CustomResponse.error(
      new CustomError(
        HttpStatus.Error.InternalServerError,
        'An unexpected error occurred while fetching plugins for the account',
        ErrorPluginOperations.PLUGIN_NOT_FOUND,
        undefined,
        { error },
      ),
    ).toJSON();
  }
};
