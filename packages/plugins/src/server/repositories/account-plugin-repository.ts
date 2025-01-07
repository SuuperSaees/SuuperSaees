import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';

import { AccountPlugin, AccountPluginInsert } from '../../types';

/**
 * @name AccountPluginRepository
 * @description Repository to handle database operations for account_plugins.
 * Interacts with the 'account_plugins' table in the database using Supabase.
 */
export class AccountPluginRepository {
  private readonly tableName = 'account_plugins';

  constructor(private client: SupabaseClient<Database>) {}

  /**
   * @name create
   * @description Inserts a new account_plugin into the 'account_plugins' table.
   * Ensures no duplicates based on provider_id and account_id.
   * @param {AccountPluginInsert} accountPlugin - The account plugin data to be inserted.
   * @returns {Promise<AccountPlugin>} The inserted account plugin data.
   * @throws {Error} If the insert operation fails.
   */
  async create(accountPlugin: AccountPluginInsert): Promise<AccountPlugin> {
    const { data, error } = await this.client
      .from(this.tableName)
      .upsert(accountPlugin as Required<AccountPluginInsert>, {
        onConflict: 'provider_id,account_id',
      })
      .select(
        `
        id,
        plugin_id,
        account_id,
        provider_id,
        status,
        credentials,
        created_at,
        updated_at,
        deleted_on
      `,
      )
      .single();

    if (error) {
      throw new Error(`Error creating account plugin: ${error.message}`);
    }

    return data as AccountPlugin;
  }

  /**
   * @name getById
   * @description Fetches an account_plugin by its unique ID from the 'account_plugins' table.
   * Ensures the account_plugin has not been marked as deleted.
   * @param {string} id - The unique ID of the account_plugin to fetch.
   * @returns {Promise<AccountPlugin | null>} The account plugin data or null if not found.
   * @throws {Error} If the fetch operation fails.
   */
  async getById(id: string): Promise<AccountPlugin | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select(
        `
        id,
        plugin_id,
        account_id,
        provider_id,
        status,
        credentials,
        created_at,
        updated_at,
        deleted_on
      `,
      )
      .eq('id', id)
      .is('deleted_on', null)
      .single();

    if (error) {
      throw new Error(`Error fetching account plugin by ID: ${error.message}`);
    }

    return data as AccountPlugin;
  }

  /**
   * @name getByAccount
   * @description Fetches account_plugins associated with a specific account ID.
   * Supports pagination using limit and offset.
   * Ensures account_plugins are not marked as deleted.
   * @param {string} accountId - The account ID to fetch account_plugins for.
   * @param {number} [limit=10] - The maximum number of account_plugins to fetch (default is 10).
   * @param {number} [offset=0] - The number of account_plugins to skip for pagination (default is 0).
   * @returns {Promise<AccountPlugin[]>} A list of account_plugins associated with the account.
   * @throws {Error} If the fetch operation fails.
   */
  async getByAccount(
    accountId: string,
    limit = 10,
    offset = 0,
  ): Promise<AccountPlugin[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select(
        `
        id,
        plugin_id,
        account_id,
        provider_id,
        status,
        credentials,
        created_at,
        updated_at,
        deleted_on
      `,
      )
      .eq('account_id', accountId)
      .is('deleted_on', null)
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(
        `Error fetching account plugins for account: ${error.message}`,
      );
    }

    return data as AccountPlugin[];
  }

  /**
   * @name update
   * @description Updates the details of an existing account_plugin in the 'account_plugins' table.
   * Ensures the account_plugin has not been marked as deleted.
   * @param {string} id - The unique ID of the account_plugin to update.
   * @param {Partial<AccountPluginInsert>} updates - The fields to update in the account_plugin.
   * @returns {Promise<AccountPlugin>} The updated account plugin data.
   * @throws {Error} If the update operation fails.
   */
  async update(
    id: string,
    updates: Partial<AccountPluginInsert>,
  ): Promise<AccountPlugin> {
    const { data, error } = await this.client
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .is('deleted_on', null)
      .select(
        `
        id,
        plugin_id,
        account_id,
        provider_id,
        status,
        credentials,
        created_at,
        updated_at,
        deleted_on
      `,
      )
      .single();

    if (error) {
      throw new Error(`Error updating account plugin: ${error.message}`);
    }

    return data as AccountPlugin;
  }

  /**
   * @name delete
   * @description Marks an account_plugin as deleted by updating its 'deleted_on' field in the 'account_plugins' table.
   * Performs a soft delete operation.
   * @param {string} id - The unique ID of the account_plugin to delete.
   * @returns {Promise<void>} Resolves when the account_plugin is successfully marked as deleted.
   * @throws {Error} If the delete operation fails.
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from(this.tableName)
      .update({ deleted_on: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting account plugin: ${error.message}`);
    }
  }
}
