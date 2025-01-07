import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';

import { Plugin, PluginInsert } from '../../types';
import { PluginRepository } from '../repositories/plugin-repository';

/**
 * @name createPlugin
 * @description Service to handle the creation of a new plugin.
 * Interacts with the repository to insert a plugin into the database.
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

    return await pluginRepository.create(data);
  } catch (error) {
    console.error('Error creating plugin:', error);
    throw new Error('Failed to create plugin');
  }
};

/**
 * @name getPluginById
 * @description Service to fetch a plugin by its unique ID.
 * Queries the repository to retrieve the plugin data.
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
 * @name getAllPlugins
 * @description Service to fetch all plugins.
 * Queries the repository to retrieve all plugins from the database.
 * @param {SupabaseClient<Database>} client - The Supabase client instance for database interactions.
 * @returns {Promise<Plugin[]>} A list of all plugins.
 * @throws {Error} If the fetch operation fails.
 */
export const getAllPlugins = async (
  client: SupabaseClient<Database>,
): Promise<Plugin[]> => {
  try {
    const pluginRepository = new PluginRepository(client);

    return await pluginRepository.getAll();
  } catch (error) {
    console.error('Error fetching all plugins:', error);
    throw new Error('Failed to fetch plugins');
  }
};

/**
 * @name updatePlugin
 * @description Service to update an existing plugin.
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
