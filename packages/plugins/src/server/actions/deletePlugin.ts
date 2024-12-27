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
import { deletePlugin } from '../services/plugin-services';

/**
 * @name deletePluginAction
 * @description Server Action to handle the deletion of a plugin.
 * Utilizes Supabase for database interactions and manages responses using CustomResponse and CustomError.
 * @param {string} id - The ID of the plugin to be deleted.
 * @returns {Promise<Object>} A standardized response indicating success or failure.
 */

export const deletePluginAction = async (id: string) => {
  try {
    const client =
      getSupabaseServerActionClient() as unknown as SupabaseClient<Database>;

    await deletePlugin(client, id);

    return CustomResponse.success(
      null,
      ErrorPluginOperations.PLUGIN_DELETED,
    ).toJSON();
  } catch (error) {
    console.error('Error deleting plugin:', error);

    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }

    return CustomResponse.error(
      new CustomError(
        HttpStatus.Error.InternalServerError,
        'An unexpected error occurred while deleting the plugin',
        ErrorPluginOperations.FAILED_TO_DELETE_PLUGIN,
        undefined,
        { error },
      ),
    ).toJSON();
  }
};
