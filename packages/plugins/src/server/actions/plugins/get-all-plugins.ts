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
import { getAllPlugins } from '../../services/plugin-services';

/**
 * @name getAllPluginsAction
 * @description Server Action to fetch all plugins.
 * Utilizes Supabase for database interactions and manages responses using CustomResponse and CustomError.
 * @returns {Promise<Object>} A standardized response containing the plugins data or an error message.
 */
export const getAllPluginsAction = async () => {
  try {
    const client =
      getSupabaseServerActionClient() as unknown as SupabaseClient<Database>;

    const plugins = await getAllPlugins(client);

    return CustomResponse.success(plugins, 'pluginsFetched').toJSON();
  } catch (error) {
    console.error('Error fetching all plugins:', error);

    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }

    return CustomResponse.error(
      new CustomError(
        HttpStatus.Error.InternalServerError,
        'An unexpected error occurred while fetching all plugins',
        ErrorPluginOperations.FAILED_TO_FETCH_PLUGIN,
        undefined,
        { error },
      ),
    ).toJSON();
  }
};
