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
import { PluginInsert } from '../../types';
import { createPlugin } from '../services/plugin-services';

/**
 * @name createPluginAction
 * @description Server Action to handle the creation of a plugin.
 * Utilizes Supabase for database interactions and manages responses using CustomResponse and CustomError.
 * @param {PluginInsert} pluginData - The data for the plugin to be created.
 * @returns {Promise<Object>} A standardized response indicating success or failure.
 */

export const createPluginAction = async (pluginData: PluginInsert) => {
  try {
    const client =
      getSupabaseServerActionClient() as unknown as SupabaseClient<Database>;

    const newPlugin = await createPlugin(client, pluginData);

    return CustomResponse.success(newPlugin, 'pluginCreated').toJSON();
  } catch (error) {
    console.error('Error creating plugin:', error);

    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }

    return CustomResponse.error(
      new CustomError(
        HttpStatus.Error.InternalServerError,
        'An unexpected error occurred while creating the plugin',
        ErrorPluginOperations.FAILED_TO_CREATE_PLUGIN,
        undefined,
        { error },
      ),
    ).toJSON();
  }
};
