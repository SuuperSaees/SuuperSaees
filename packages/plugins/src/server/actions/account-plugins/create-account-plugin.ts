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
import { createAccountPlugin } from '../../services/account-plugin-service';

/**
 * @name createAccountPluginAction
 * @description Server Action to handle the creation of an account_plugin.
 * Utilizes Supabase for database interactions and manages responses using CustomResponse and CustomError.
 * @param {AccountPluginInsert} accountPluginData - The data for the account_plugin to be created.
 * @returns {Promise<Object>} A standardized response indicating success or failure.
 */
export const createAccountPluginAction = async (
  accountPluginData: AccountPluginInsert,
) => {
  try {
    const client =
      getSupabaseServerActionClient() as unknown as SupabaseClient<Database>;

    const newAccountPlugin = await createAccountPlugin(
      client,
      accountPluginData,
    );

    return CustomResponse.success(
      newAccountPlugin,
      'accountPluginCreated',
    ).toJSON();
  } catch (error) {
    console.error('Error creating account plugin:', error);

    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }

    return CustomResponse.error(
      new CustomError(
        HttpStatus.Error.InternalServerError,
        'An unexpected error occurred while creating the account plugin',
        ErrorPluginOperations.FAILED_TO_CREATE_PLUGIN,
        undefined,
        { error },
      ),
    ).toJSON();
  }
};
