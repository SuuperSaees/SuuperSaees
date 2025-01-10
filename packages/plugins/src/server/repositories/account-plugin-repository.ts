import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';

import {
  AccountPlugin,
  AccountPluginInsert,
  BillingAccountInsert,
} from '../../types';

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
   * Ensures no duplicates based on plugin_id and account_id, and creates the corresponding billing account.
   * @param {AccountPluginInsert} accountPlugin - The account plugin data to be inserted.
   * @param {BillingAccountInsert} billingAccount - The billing account data to be inserted.
   * @returns {Promise<AccountPlugin>} The inserted account plugin data.
   * @throws {Error} If the insert operation fails.
   */
  async create(
    accountPlugin: AccountPluginInsert,
    billingAccount: BillingAccountInsert,
  ): Promise<AccountPlugin> {
    try {
      const { data: pluginData, error: pluginError } = await this.client
        .from(this.tableName)
        .upsert(
          {
            ...accountPlugin,
            deleted_on: null,
          } as Required<AccountPluginInsert>,
          {
            onConflict: 'plugin_id,account_id',
          },
        )
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

      if (pluginError) {
        throw new Error(
          `[REPOSITORY] Error creating account plugin: ${pluginError.message}`,
        );
      }

      if (
        billingAccount.provider !== ('loom' as BillingAccountInsert['provider'])
      ) {
        const { error: billingError } = await this.client
          .from('billing_accounts')
          .upsert(
            {
              ...billingAccount,
            },
            { onConflict: 'account_id,provider' },
          );

        if (billingError) {
          throw new Error(
            `[REPOSITORY] Error creating billing account: ${billingError.message}`,
          );
        }
      }

      return pluginData as AccountPlugin;
    } catch (error) {
      throw new Error(
        `[REPOSITORY] Error in create method: ${(error as Error).message}`,
      );
    }
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
      throw new Error(
        `[REPOSITORY] Error fetching account plugin by ID: ${error.message}`,
      );
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
        `[REPOSITORY] Error fetching account plugins for account: ${error.message}`,
      );
    }

    return data as AccountPlugin[];
  }

  /**
   * @name update
   * @description Updates an account_plugin and its billing_account (excluding `loom`).
   * @param {string} id - The unique ID of the account_plugin to update.
   * @param {Partial<AccountPluginInsert>} updates - The fields to update in the account_plugin.
   * @param {Partial<BillingAccountInsert>} billingUpdates - The fields to update in the billing_account.
   * @returns {Promise<AccountPlugin>} The updated account_plugin data.
   * @throws {Error} If the update operation fails.
   */
  async update(
    id: string,
    updates: Partial<AccountPluginInsert>,
    billingUpdates: Partial<BillingAccountInsert>,
  ): Promise<AccountPlugin> {
    try {
      const { data: pluginData, error: pluginError } = await this.client
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

      if (pluginError) {
        throw new Error(
          `[REPOSITORY] Error updating account plugin: ${pluginError.message}`,
        );
      }

      if (!billingUpdates.account_id || !billingUpdates.provider) {
        throw new Error(
          `[REPOSITORY] Account ID and Provider are required for updating billing account.`,
        );
      }

      const { error: billingError } = await this.client
        .from('billing_accounts')
        .update({
          credentials: billingUpdates.credentials,
          updated_at: new Date().toISOString(),
        })
        .eq('account_id', billingUpdates.account_id)
        .eq('provider', billingUpdates.provider as string)
        .is('deleted_on', null);

      if (billingError) {
        throw new Error(
          `[REPOSITORY] Error updating billing account: ${billingError.message}`,
        );
      }

      return pluginData as AccountPlugin;
    } catch (error) {
      throw new Error(
        `[REPOSITORY] Error in update method: ${(error as Error).message}`,
      );
    }
  }

  /**
   * @name updateLoom
   * @description Updates only the account_plugin table for `loom`.
   * @param {string} id - The unique ID of the account_plugin to update.
   * @param {Partial<AccountPluginInsert>} updates - The fields to update in the account_plugin.
   * @returns {Promise<AccountPlugin>} The updated account_plugin data.
   * @throws {Error} If the update operation fails.
   */
  async updateLoom(
    id: string,
    updates: Partial<AccountPluginInsert>,
  ): Promise<AccountPlugin> {
    try {
      const { data: pluginData, error: pluginError } = await this.client
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

      if (pluginError) {
        throw new Error(
          `[REPOSITORY] Error updating loom account plugin: ${pluginError.message}`,
        );
      }

      return pluginData as AccountPlugin;
    } catch (error) {
      throw new Error(
        `[REPOSITORY] Error in updateLoom method: ${(error as Error).message}`,
      );
    }
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
      throw new Error(
        `[REPOSITORY] Error deleting account plugin: ${error.message}`,
      );
    }
  }
}
