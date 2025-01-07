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
import { PluginInsert } from '../../../types';
import { updatePlugin } from '../../services/plugin-services';

/**
 * @name updatePluginAction
 * @description Server Action to handle updates to an existing plugin.
 * Utilizes Supabase for database interactions and manages responses using CustomResponse and CustomError.
 * @param {string} id - The ID of the plugin to update.
 * @param {Partial<PluginInsert>} updates - The fields to update in the plugin.
 * @param {File | null} image - The optional new image file to upload as the plugin's icon.
 * @returns {Promise<Object>} A standardized response indicating success or failure.
 */
export const updatePluginAction = async (
  id: string,
  updates: Partial<PluginInsert>,
  image: File | null,
) => {
  try {
    const client =
      getSupabaseServerActionClient() as unknown as SupabaseClient<Database>;

    const updatedPlugin = await updatePlugin(client, id, updates, image);

    return CustomResponse.success(updatedPlugin, 'pluginUpdated').toJSON();
  } catch (error) {
    console.error('Error updating plugin:', error);

    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }

    return CustomResponse.error(
      new CustomError(
        HttpStatus.Error.InternalServerError,
        'An unexpected error occurred while updating the plugin',
        ErrorPluginOperations.FAILED_TO_UPDATE_PLUGIN,
        undefined,
        { error },
      ),
    ).toJSON();
  }
};
