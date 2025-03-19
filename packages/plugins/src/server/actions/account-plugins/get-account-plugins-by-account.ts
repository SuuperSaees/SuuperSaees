'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import {
  CustomError,
  CustomResponse,
  ErrorPluginOperations,
} from '../../../../../shared/src/response';
import { HttpStatus } from '../../../../../shared/src/response/http-status';
import { getAccountPluginsByAccount } from '../../services/account-plugin-service';

/**
 * @name getAccountPluginsByAccountAction
 * @description Server Action to fetch account_plugins associated with a specific account.
 * Utilizes Supabase for database interactions and manages responses using CustomResponse and CustomError.
 * @param {string} accountId - The ID of the account to fetch account_plugins for.
 * @param {number} limit - The maximum number of account_plugins to fetch.
 * @param {number} offset - The offset for pagination.
 * @returns {Promise<Object>} A standardized response containing the account_plugins data or an error message.
 */
export const getAccountPluginsByAccountAction = async (
  accountId: string,
  limit: number,
  offset: number,
) => {
  try {
    const client =
      getSupabaseServerActionClient() as unknown as SupabaseClient<Database>;

    const accountPlugins = await getAccountPluginsByAccount(
      client,
      accountId,
      limit,
      offset,
    );

    return CustomResponse.success(
      accountPlugins,
      'accountPluginsFetched',
    ).toJSON();
  } catch (error) {
    console.error('Error getting account plugins for account:', error);

    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }

    return CustomResponse.error(
      new CustomError(
        HttpStatus.Error.InternalServerError,
        'An unexpected error occurred while fetching account plugins for the account',
        ErrorPluginOperations.PLUGIN_NOT_FOUND,
        undefined,
        { error },
      ),
    ).toJSON();
  }
};
