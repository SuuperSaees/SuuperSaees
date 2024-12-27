import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';

import { Plugin, PluginInsert } from '../../types';
import { PluginRepository } from '../repositories/plugin-repository';
import { validatePluginInsert } from '../utils/validations';
import { generateUUID } from '../utils/validations';

/**
 * @name createPlugin
 * @description Service to handle the creation of a new plugin.
 * Validates the input data, generates a provider ID if missing, and saves the plugin in the database.
 * @param {SupabaseClient<Database>} client - The Supabase client instance for database interactions.
 * @param {PluginInsert} data - The data required to create a plugin.
 * @returns {Promise<Plugin>} The created plugin.
 * @throws {Error} If the plugin creation fails.
 */
export const createPlugin = async (
  client: SupabaseClient<Database>,
  data: PluginInsert,
): Promise<Plugin> => {
  try {
    const pluginRepository = new PluginRepository(client);

    validatePluginInsert(data);

    if (!data.provider_id) {
      data.provider_id = generateUUID();
    }

    return await pluginRepository.create(data);
  } catch (error) {
    console.error('Error creating plugin:', error);
    throw new Error('Failed to create plugin');
  }
};

/**
 * @name getPluginById
 * @description Service to fetch a plugin by its unique ID.
 * Queries the database to retrieve the plugin data.
 * @param {SupabaseClient<Database>} client - The Supabase client instance for database interactions.
 * @param {string} pluginId - The unique ID of the plugin to fetch.
 * @returns {Promise<Plugin>} The plugin data.
 * @throws {Error} If the plugin is not found or the fetch operation fails.
 */
export const getPluginById = async (
  client: SupabaseClient<Database>,
  pluginId: string,
): Promise<Plugin> => {
  try {
    const pluginRepository = new PluginRepository(client);

    const plugin = await pluginRepository.getById(pluginId);

    if (!plugin) {
      throw new Error('Plugin not found');
    }

    return plugin;
  } catch (error) {
    console.error('Error fetching plugin by ID:', error);
    throw new Error('Failed to get plugin by ID');
  }
};

/**
 * @name getPluginsByAccount
 * @description Service to fetch all plugins associated with a specific account.
 * Supports pagination using limit and offset.
 * @param {SupabaseClient<Database>} client - The Supabase client instance for database interactions.
 * @param {string} accountId - The ID of the account to fetch plugins for.
 * @param {number} [limit=10] - The maximum number of plugins to fetch (default is 10).
 * @param {number} [offset=0] - The number of plugins to skip for pagination (default is 0).
 * @returns {Promise<Plugin[]>} A list of plugins associated with the account.
 * @throws {Error} If the fetch operation fails.
 */
export const getPluginsByAccount = async (
  client: SupabaseClient<Database>,
  accountId: string,
  limit = 10,
  offset = 0,
): Promise<Plugin[]> => {
  try {
    const pluginRepository = new PluginRepository(client);

    return await pluginRepository.getByAccount(accountId, limit, offset);
  } catch (error) {
    console.error('Error fetching plugins for account:', error);
    throw new Error('Failed to get plugins for account');
  }
};

/**
 * @name updatePlugin
 * @description Service to update the details of an existing plugin.
 * Applies the specified updates to the plugin in the database.
 * @param {SupabaseClient<Database>} client - The Supabase client instance for database interactions.
 * @param {string} id - The unique ID of the plugin to update.
 * @param {Partial<PluginInsert>} updates - The fields to update in the plugin.
 * @returns {Promise<Plugin>} The updated plugin data.
 * @throws {Error} If the update operation fails.
 */
export const updatePlugin = async (
  client: SupabaseClient<Database>,
  id: string,
  updates: Partial<PluginInsert>,
): Promise<Plugin> => {
  try {
    const pluginRepository = new PluginRepository(client);

    return await pluginRepository.update(id, updates);
  } catch (error) {
    console.error('Error updating plugin:', error);
    throw new Error('Failed to update plugin');
  }
};

/**
 * @name deletePlugin
 * @description Service to delete a plugin by marking it as deleted in the database.
 * Performs a soft delete operation.
 * @param {SupabaseClient<Database>} client - The Supabase client instance for database interactions.
 * @param {string} id - The unique ID of the plugin to delete.
 * @returns {Promise<void>} Resolves when the plugin is successfully deleted.
 * @throws {Error} If the delete operation fails.
 */
export const deletePlugin = async (
  client: SupabaseClient<Database>,
  id: string,
): Promise<void> => {
  try {
    const pluginRepository = new PluginRepository(client);

    await pluginRepository.delete(id);
  } catch (error) {
    console.error('Error deleting plugin:', error);
    throw new Error('Failed to delete plugin');
  }
};
