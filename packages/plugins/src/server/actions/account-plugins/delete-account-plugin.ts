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
import { deleteAccountPlugin } from '../../services/account-plugin-service';

/**
 * @name deleteAccountPluginAction
 * @description Server Action to handle the deletion of an account_plugin and its associated billing_account.
 * Utilizes Supabase for database interactions and manages responses using CustomResponse and CustomError.
 * @param {string} id - The ID of the account_plugin to be deleted.
 * @param {string} accountId - The ID of the account associated with the billing_account.
 * @param {string} provider - The provider name of the billing_account.
 * @returns {Promise<Object>} A standardized response indicating success or failure.
 */
export const deleteAccountPluginAction = async (
  id: string,
  accountId: string,
  provider: string,
) => {
  try {
    const client =
      getSupabaseServerActionClient() as unknown as SupabaseClient<Database>;

    await deleteAccountPlugin(client, id, accountId, provider);

    return CustomResponse.success(
      null,
      ErrorPluginOperations.PLUGIN_DELETED,
    ).toJSON();
  } catch (error) {
    console.error('Error deleting account plugin:', error);

    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }

    return CustomResponse.error(
      new CustomError(
        HttpStatus.Error.InternalServerError,
        'An unexpected error occurred while deleting the account plugin and billing account',
        ErrorPluginOperations.FAILED_TO_DELETE_PLUGIN,
        undefined,
        { error },
      ),
    ).toJSON();
  }
};
