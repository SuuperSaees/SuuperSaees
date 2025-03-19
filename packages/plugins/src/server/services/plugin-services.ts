import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';

import { Plugin, PluginInsert } from '../../types';
import { PluginRepository } from '../repositories/plugin-repository';

/**
 * Helper to initialize the PluginRepository.
 * @param {SupabaseClient<Database>} client - The Supabase client instance.
 * @returns {PluginRepository} An instance of the PluginRepository.
 */
const getPluginRepository = (
  client: SupabaseClient<Database>,
): PluginRepository => {
  return new PluginRepository(client);
};

/**
 * @name createPlugin
 * @description Service to handle the creation of a new plugin.
 * Interacts with the repository to insert a plugin into the database and optionally upload an image.
 * @param {SupabaseClient<Database>} client - The Supabase client instance for database interactions.
 * @param {PluginInsert} data - The data required to create a plugin.
 * @param {File | null} image - The optional image file to upload.
 * @returns {Promise<Plugin>} The created plugin.
 * @throws {Error} If the plugin creation or image upload fails.
 */
export const createPlugin = async (
  client: SupabaseClient<Database>,
  data: PluginInsert,
  image: File | null,
): Promise<Plugin> => {
  const pluginRepository = getPluginRepository(client);
  return await pluginRepository.create(data, image);
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
  const pluginRepository = getPluginRepository(client);
  const plugin = await pluginRepository.getById(pluginId);
  if (!plugin) throw new Error('Plugin not found');
  return plugin;
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
  const pluginRepository = getPluginRepository(client);
  return await pluginRepository.getAll();
};

/**
 * @name updatePlugin
 * @description Service to update an existing plugin.
 * Applies the specified updates to the plugin in the database and optionally upload a new image.
 * @param {SupabaseClient<Database>} client - The Supabase client instance for database interactions.
 * @param {string} id - The unique ID of the plugin to update.
 * @param {Partial<PluginInsert>} updates - The fields to update in the plugin.
 * @param {File | null} image - The optional new image file to upload.
 * @returns {Promise<Plugin>} The updated plugin data.
 * @throws {Error} If the update or image upload operation fails.
 */
export const updatePlugin = async (
  client: SupabaseClient<Database>,
  id: string,
  updates: Partial<PluginInsert>,
  image: File | null,
): Promise<Plugin> => {
  const pluginRepository = getPluginRepository(client);
  return await pluginRepository.update(id, updates, image);
};

/**
 * @name deletePlugin
 * @description Service to delete a plugin by marking it as deleted in the database.
 * Delegates the soft delete operation to the repository.
 * @param {SupabaseClient<Database>} client - The Supabase client instance for database interactions.
 * @param {string} id - The unique ID of the plugin to delete.
 * @returns {Promise<void>} Resolves when the plugin is successfully deleted.
 * @throws {Error} If the delete operation fails.
 */
export const deletePlugin = async (
  client: SupabaseClient<Database>,
  id: string,
): Promise<void> => {
  const pluginRepository = getPluginRepository(client);
  return await pluginRepository.delete(id);
};
