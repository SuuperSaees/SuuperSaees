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
import { getPluginById } from '../../services/plugin-services';

/**
 * @name getPluginByIdAction
 * @description Server Action to fetch a plugin by its unique ID.
 * Utilizes Supabase for database interactions and manages responses using CustomResponse and CustomError.
 * @param {string} pluginId - The ID of the plugin to fetch.
 * @returns {Promise<Object>} A standardized response containing the plugin data or an error message.
 */
export const getPluginByIdAction = async (pluginId: string) => {
  try {
    const client =
      getSupabaseServerActionClient() as unknown as SupabaseClient<Database>;

    const plugin = await getPluginById(client, pluginId);

    if (!plugin) {
      throw new CustomError(
        HttpStatus.Error.NotFound,
        'Plugin not found',
        ErrorPluginOperations.PLUGIN_NOT_FOUND,
      );
    }

    return CustomResponse.success(plugin, 'pluginFetched').toJSON();
  } catch (error) {
    console.error('Error fetching plugin by ID:', error);

    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }

    return CustomResponse.error(
      new CustomError(
        HttpStatus.Error.InternalServerError,
        'An unexpected error occurred while fetching the plugin',
        ErrorPluginOperations.FAILED_TO_FETCH_PLUGIN,
        undefined,
        { error },
      ),
    ).toJSON();
  }
};
