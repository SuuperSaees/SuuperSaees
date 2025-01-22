'use server';

import { SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

import { Database } from '@kit/supabase/database';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';


import { HttpStatus } from '../../../../../shared/src/response/http-status';
import { updatePluginStatus } from '../../services/account-plugin-service';
import { CustomError, CustomResponse, ErrorPluginOperations } from '../../../../../shared/src/response';

/**
 * @name updatePluginStatusAction
 * @description Server Action to update the status of a specific account_plugin.
 * @param {string} id - The unique ID of the `account_plugin` to update.
 * @param {"installed" | "uninstalled" | "failed" | "in progress" | null} status - The new status to set for the plugin.
 * @returns {Promise<Object>} A standardized response indicating success or failure.
 */
export const updatePluginStatusAction = async (
  id: string,
  status: 'installed' | 'uninstalled' | 'failed' | 'in progress' | null,
) => {
  try {
    if (!id || !status) {
      throw new CustomError(
        HttpStatus.Error.BadRequest,
        'Plugin ID and status are required',
        ErrorPluginOperations.FAILED_TO_UPDATE_PLUGIN,
      );
    }

    revalidatePath('/apps');

    const client =
      getSupabaseServerActionClient() as unknown as SupabaseClient<Database>;

    await updatePluginStatus(client, id, status);

    return CustomResponse.success(
      null,
      'Plugin status updated successfully',
    ).toJSON();
  } catch (error) {
    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }

    return CustomResponse.error(
      new CustomError(
        HttpStatus.Error.InternalServerError,
        'Failed to update plugin status',
        ErrorPluginOperations.FAILED_TO_UPDATE_PLUGIN,
        undefined,
        { error },
      ),
    ).toJSON();
  }
};
