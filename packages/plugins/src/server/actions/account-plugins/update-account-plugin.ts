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
import { AccountPluginInsert } from '../../../types';
import { updateAccountPlugin } from '../../services/account-plugin-service';

/**
 * @name updateAccountPluginAction
 * @description Server Action to handle updates to an existing account_plugin.
 * Utilizes Supabase for database interactions and manages responses using CustomResponse and CustomError.
 * @param {string} id - The ID of the account_plugin to update.
 * @param {Partial<AccountPluginInsert>} updates - The fields to update in the account_plugin.
 * @returns {Promise<Object>} A standardized response indicating success or failure.
 */
export const updateAccountPluginAction = async (
  id: string,
  updates: Partial<AccountPluginInsert>,
) => {
  try {
    const client =
      getSupabaseServerActionClient() as unknown as SupabaseClient<Database>;

    const updatedAccountPlugin = await updateAccountPlugin(client, id, updates);

    return CustomResponse.success(
      updatedAccountPlugin,
      'accountPluginUpdated',
    ).toJSON();
  } catch (error) {
    console.error('Error updating account plugin:', error);

    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }

    return CustomResponse.error(
      new CustomError(
        HttpStatus.Error.InternalServerError,
        'An unexpected error occurred while updating the account plugin',
        ErrorPluginOperations.FAILED_TO_UPDATE_PLUGIN,
        undefined,
        { error },
      ),
    ).toJSON();
  }
};
