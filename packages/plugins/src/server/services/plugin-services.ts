import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';

import { Plugin, PluginInsert, ServiceError } from '../../types';
import { PluginRepository } from '../repositories/plugin-repository';
import { validatePluginInsert } from '../utils/validations';
import { generateUUID } from '../utils/validations';

export const createPlugin = async (
  client: SupabaseClient<Database>,
  data: PluginInsert,
): Promise<{
  success: boolean;
  message: string;
  data?: Plugin;
  error?: ServiceError;
}> => {
  try {
    const pluginRepository = new PluginRepository(client);

    validatePluginInsert(data);

    if (!data.provider_id) {
      data.provider_id = generateUUID();
    }

    const plugin = await pluginRepository.create(data);

    return {
      success: true,
      message: 'Plugin created successfully',
      data: plugin,
    };
  } catch (error) {
    console.error('Error creating plugin:', error);
    if (error instanceof Error) {
      return {
        success: false,
        message: 'Failed to create plugin',
        error: { message: error.message, error },
      };
    }
    return {
      success: false,
      message: 'Failed to create plugin',
      error: { message: 'Unknown error', error: new Error(String(error)) },
    };
  }
};

export const getPluginById = async (
  client: SupabaseClient<Database>,
  pluginId: string,
): Promise<{
  success: boolean;
  message: string;
  data?: Plugin;
  error?: ServiceError;
}> => {
  try {
    const pluginRepository = new PluginRepository(client);

    const plugin = await pluginRepository.getById(pluginId);

    return plugin
      ? { success: true, message: 'Plugin fetched successfully', data: plugin }
      : {
          success: false,
          message: 'Plugin not found',
          error: { message: 'Plugin not found' },
        };
  } catch (error) {
    console.error('Error fetching plugin by ID:', error);
    if (error instanceof Error) {
      return {
        success: false,
        message: 'Failed to get plugin by ID',
        error: { message: error.message, error },
      };
    }
    return {
      success: false,
      message: 'Failed to get plugin by ID',
      error: { message: 'Unknown error', error: new Error(String(error)) },
    };
  }
};

export const getPluginsByAccount = async (
  client: SupabaseClient<Database>,
  accountId: string,
  limit = 10,
  offset = 0,
): Promise<{
  success: boolean;
  message: string;
  data?: Plugin[];
  error?: ServiceError;
}> => {
  try {
    const pluginRepository = new PluginRepository(client);

    const plugins = await pluginRepository.getByAccount(
      accountId,
      limit,
      offset,
    );

    return {
      success: true,
      message: 'Plugins fetched successfully',
      data: plugins,
    };
  } catch (error) {
    console.error('Error fetching plugins for account:', error);
    if (error instanceof Error) {
      return {
        success: false,
        message: 'Failed to get plugins for account',
        error: { message: error.message, error },
      };
    }
    return {
      success: false,
      message: 'Failed to get plugins for account',
      error: { message: 'Unknown error', error: new Error(String(error)) },
    };
  }
};

export const updatePlugin = async (
  client: SupabaseClient<Database>,
  id: string,
  updates: Partial<PluginInsert>,
): Promise<{
  success: boolean;
  message: string;
  data?: Plugin;
  error?: ServiceError;
}> => {
  try {
    const pluginRepository = new PluginRepository(client);

    const updatedPlugin = await pluginRepository.update(id, updates);

    return {
      success: true,
      message: 'Plugin updated successfully',
      data: updatedPlugin,
    };
  } catch (error) {
    console.error('Error updating plugin:', error);
    if (error instanceof Error) {
      return {
        success: false,
        message: 'Failed to update plugin',
        error: { message: error.message, error },
      };
    }
    return {
      success: false,
      message: 'Failed to update plugin',
      error: { message: 'Unknown error', error: new Error(String(error)) },
    };
  }
};

export const deletePlugin = async (
  client: SupabaseClient<Database>,
  id: string,
): Promise<{ success: boolean; message: string; error?: ServiceError }> => {
  try {
    const pluginRepository = new PluginRepository(client);

    await pluginRepository.delete(id);

    return { success: true, message: 'Plugin deleted successfully' };
  } catch (error) {
    console.error('Error deleting plugin:', error);
    if (error instanceof Error) {
      return {
        success: false,
        message: 'Failed to delete plugin',
        error: { message: error.message, error },
      };
    }
    return {
      success: false,
      message: 'Failed to delete plugin',
      error: { message: 'Unknown error', error: new Error(String(error)) },
    };
  }
};
