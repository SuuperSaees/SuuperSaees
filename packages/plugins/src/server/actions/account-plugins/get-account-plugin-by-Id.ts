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
import { getAccountPluginById } from '../../services/account-plugin-service';

/**
 * @name getAccountPluginByIdAction
 * @description Server Action to fetch an account_plugin by its ID.
 * Utilizes Supabase for database interactions and manages responses using CustomResponse and CustomError.
 * @param {string} accountPluginId - The ID of the account_plugin to fetch.
 * @returns {Promise<Object>} A standardized response containing the account_plugin data or an error message.
 */
export const getAccountPluginByIdAction = async (accountPluginId: string) => {
  try {
    const client =
      getSupabaseServerActionClient() as unknown as SupabaseClient<Database>;

    const accountPlugin = await getAccountPluginById(client, accountPluginId);

    return CustomResponse.success(
      accountPlugin,
      'accountPluginFetched',
    ).toJSON();
  } catch (error) {
    console.error('Error getting account plugin:', error);

    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }

    return CustomResponse.error(
      new CustomError(
        HttpStatus.Error.InternalServerError,
        'An unexpected error occurred while fetching the account plugin',
        ErrorPluginOperations.PLUGIN_NOT_FOUND,
        undefined,
        { error },
      ),
    ).toJSON();
  }
};
