import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';

import { Plugin, PluginInsert } from '../../types';

/**
 * @name PluginRepository
 * @description Repository to handle database operations for plugins.
 * Interacts with the 'plugins' table in the database using Supabase.
 */
export class PluginRepository {
  private readonly tableName = 'plugins';

  constructor(private client: SupabaseClient<Database>) {}

  /**
   * @name create
   * @description Inserts a new plugin into the 'plugins' table.
   * @param {PluginInsert} plugin - The plugin data to be inserted.
   * @returns {Promise<Plugin>} The inserted plugin data.
   * @throws {Error} If the insert operation fails.
   */
  async create(plugin: PluginInsert): Promise<Plugin> {
    const { data, error } = await this.client
      .from(this.tableName)
      .insert(plugin)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating plugin: ${error.message}`);
    }

    return data as Plugin;
  }

  /**
   * @name getById
   * @description Fetches a plugin by its unique ID from the 'plugins' table.
   * Ensures the plugin has not been marked as deleted.
   * @param {string} id - The unique ID of the plugin to fetch.
   * @returns {Promise<Plugin | null>} The plugin data or null if not found.
   * @throws {Error} If the fetch operation fails.
   */
  async getById(id: string): Promise<Plugin | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .is('deleted_on', null)
      .single();

    if (error) {
      throw new Error(`Error fetching plugin by ID: ${error.message}`);
    }

    return data as Plugin;
  }

  /**
   * @name getByAccount
   * @description Fetches plugins associated with a specific account ID.
   * Supports pagination using limit and offset.
   * Ensures plugins are not marked as deleted.
   * @param {string} accountId - The account ID to fetch plugins for.
   * @param {number} [limit=10] - The maximum number of plugins to fetch (default is 10).
   * @param {number} [offset=0] - The number of plugins to skip for pagination (default is 0).
   * @returns {Promise<Plugin[]>} A list of plugins associated with the account.
   * @throws {Error} If the fetch operation fails.
   */
  async getByAccount(
    accountId: string,
    limit = 10,
    offset = 0,
  ): Promise<Plugin[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('account_id', accountId)
      .is('deleted_on', null)
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Error fetching plugins for account: ${error.message}`);
    }

    return data;
  }

  /**
   * @name update
   * @description Updates the details of an existing plugin in the 'plugins' table.
   * Ensures the plugin has not been marked as deleted.
   * @param {string} id - The unique ID of the plugin to update.
   * @param {Partial<PluginInsert>} updates - The fields to update in the plugin.
   * @returns {Promise<Plugin>} The updated plugin data.
   * @throws {Error} If the update operation fails.
   */

  async update(id: string, updates: Partial<PluginInsert>): Promise<Plugin> {
    const { data, error } = await this.client
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .is('deleted_on', null)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating plugin: ${error.message}`);
    }

    return data;
  }

  /**
   * @name delete
   * @description Marks a plugin as deleted by updating its 'deleted_on' field in the 'plugins' table.
   * Performs a soft delete operation.
   * @param {string} id - The unique ID of the plugin to delete.
   * @returns {Promise<void>} Resolves when the plugin is successfully marked as deleted.
   * @throws {Error} If the delete operation fails.
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from(this.tableName)
      .update({ deleted_on: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting plugin: ${error.message}`);
    }
  }
}
