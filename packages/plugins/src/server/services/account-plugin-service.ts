import { SupabaseClient } from '@supabase/supabase-js';

import { Database, Json } from '@kit/supabase/database';

import {
  CredentialsCrypto,
  EncryptedCredentials,
} from '../../../../../apps/web/app/utils/credentials-crypto';
import {
  AccountPlugin,
  AccountPluginInsert,
  BillingAccountInsert,
} from '../../types';
import { AccountPluginRepository } from '../repositories/account-plugin-repository';
import { validatePluginInsert } from '../utils/validations';

const SECRET_KEY = Buffer.from(process.env.CREDENTIALS_SECRET_KEY ?? '', 'hex');

/**
 * @name createAccountPlugin
 * @description Service to handle the creation of a new `account_plugin`.
 * Validates the input data and saves the `account_plugin` in the database.
 * Also ensures a corresponding entry is created in the `billing_accounts` table.
 * @param {SupabaseClient<Database>} client - The Supabase client instance for database interactions.
 * @param {AccountPluginInsert} data - The data required to create an `account_plugin`.
 * @returns {Promise<AccountPlugin>} The created `account_plugin`.
 * @throws {Error} If any error occurs during the creation of the `account_plugin`.
 */
export const createAccountPlugin = async (
  client: SupabaseClient<Database>,
  data: AccountPluginInsert,
): Promise<AccountPlugin> => {
  try {
    const accountPluginRepository = new AccountPluginRepository(client);

    validatePluginInsert(data);

    if (
      data.credentials &&
      typeof data.credentials === 'object' &&
      !Array.isArray(data.credentials) &&
      Object.keys(data.credentials).length > 0
    ) {
      const { data: pluginData, error: pluginError } = await client
        .from('plugins')
        .select('name')
        .eq('id', data.plugin_id)
        .single();

      if (pluginError ?? !pluginData) {
        throw new Error(
          `[SERVICE] Failed to retrieve plugin data for provider assignment. Plugin ID: ${data.plugin_id}`,
        );
      }

      const provider = pluginData.name.toLowerCase();

      if (provider !== 'stripe') {
        const crypto = new CredentialsCrypto(SECRET_KEY);
        const encryptedCredentials: EncryptedCredentials = crypto.encrypt(
          data.credentials,
        );
        data.credentials = JSON.stringify(encryptedCredentials);
      }
    } else if (data.credentials && typeof data.credentials === 'object') {
      data.credentials = null;
    }

    const { data: pluginData, error: pluginError } = await client
      .from('plugins')
      .select('name')
      .eq('id', data.plugin_id)
      .single();

    if (pluginError ?? !pluginData) {
      throw new Error(
        `[SERVICE] Failed to retrieve plugin data for provider assignment. Plugin ID: ${data.plugin_id}`,
      );
    }

    const provider = pluginData.name.toLowerCase() as
      | 'stripe'
      | 'treli'
      | 'paddle'
      | 'suuper'
      | 'lemon-squeezy';

    const billingData: BillingAccountInsert = {
      account_id: data.account_id,
      provider,
      credentials: null,
      namespace: 'default-namespace',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return await accountPluginRepository.create(data, billingData);
  } catch (error) {
    throw new Error(
      `[SERVICE] Failed to create account plugin: ${(error as Error).message}`,
    );
  }
};

/**
 * @name getAccountPluginById
 * @description Service to fetch an account_plugin by its unique ID.
 * Queries the database to retrieve the account_plugin data.
 * @param {SupabaseClient<Database>} client - The Supabase client instance for database interactions.
 * @param {string} accountPluginId - The unique ID of the account_plugin to fetch.
 * @returns {Promise<AccountPlugin>} The account_plugin data.
 * @throws {Error} If the account_plugin is not found or the fetch operation fails.
 */
export const getAccountPluginById = async (
  client: SupabaseClient<Database>,
  accountPluginId: string,
): Promise<AccountPlugin> => {
  try {
    const accountPluginRepository = new AccountPluginRepository(client);

    const accountPlugin =
      await accountPluginRepository.getById(accountPluginId);

    if (!accountPlugin) {
      throw new Error('[SERVICE] Account plugin not found');
    }

    const pluginData = await client
      .from('plugins')
      .select('id, name')
      .eq('id', accountPlugin.plugin_id)
      .single();

    if (!pluginData.data) {
      throw new Error('[SERVICE] Plugin data not found');
    }

    const pluginName = pluginData.data.name.toLowerCase();

    if (pluginName !== 'stripe' && accountPlugin.credentials) {
      const crypto = new CredentialsCrypto(SECRET_KEY);
      try {
        const decryptedCredentials = crypto.decrypt<Record<string, unknown>>(
          JSON.parse(
            accountPlugin.credentials as string,
          ) as EncryptedCredentials,
        );

        accountPlugin.credentials = JSON.parse(
          JSON.stringify(decryptedCredentials),
        ) as Json;
      } catch (error) {
        throw new Error(
          '[SERVICE] Failed to decrypt account plugin credentials',
        );
      }
    }

    return accountPlugin;
  } catch (error) {
    throw new Error(
      `[SERVICE] Failed to get account plugin by ID: ${(error as Error).message}`,
    );
  }
};

/**
 * @name getAccountPluginsByAccount
 * @description Service to fetch all account_plugins associated with a specific account.
 * Supports pagination using limit and offset.
 * @param {SupabaseClient<Database>} client - The Supabase client instance for database interactions.
 * @param {string} accountId - The ID of the account to fetch account_plugins for.
 * @param {number} [limit=10] - The maximum number of account_plugins to fetch (default is 10).
 * @param {number} [offset=0] - The number of account_plugins to skip for pagination (default is 0).
 * @returns {Promise<AccountPlugin[]>} A list of account_plugins associated with the account.
 * @throws {Error} If the fetch operation fails.
 */
export const getAccountPluginsByAccount = async (
  client: SupabaseClient<Database>,
  accountId: string,
  limit = 10,
  offset = 0,
): Promise<AccountPlugin[]> => {
  try {
    const accountPluginRepository = new AccountPluginRepository(client);

    return await accountPluginRepository.getByAccount(accountId, limit, offset);
  } catch (error) {
    throw new Error(
      `[SERVICE] Failed to get account plugins for account: ${(error as Error).message}`,
    );
  }
};

/**
 * @name updateAccountPlugin
 * @description Updates an account_plugin and its billing_account if applicable, handling encryption, provider_id synchronization, and Loom-specific logic.
 * @param {SupabaseClient<Database>} client - Supabase client for database interactions.
 * @param {string} id - The ID of the account_plugin to update.
 * @param {Partial<AccountPluginInsert> & { provider?: string; account_id?: string; provider_id?: string }} updates - Data to update, including optional provider_id.
 * @returns {Promise<AccountPlugin>} The updated account_plugin.
 * @throws {Error} If required fields are missing or the update fails.
 */

export const updateAccountPlugin = async (
  client: SupabaseClient<Database>,
  id: string,
  updates: Partial<AccountPluginInsert> & {
    provider?: string;
    account_id?: string;
    provider_id?: string;
  },
): Promise<AccountPlugin> => {
  try {
    const accountPluginRepository = new AccountPluginRepository(client);

    if (updates.provider !== 'loom') {
      if (!updates.account_id || !updates.provider) {
        throw new Error(
          '[SERVICE] Account ID and Provider are required for updating billing account.',
        );
      }
    }

    let providerId = updates.provider_id;

    if (!providerId) {
      const fetchedProviderId = await accountPluginRepository.getProviderId(
        id,
        updates.provider,
        updates.account_id,
      );

      providerId = fetchedProviderId ?? crypto.randomUUID();
    }

    if (
      updates.provider !== 'stripe' &&
      updates.credentials &&
      typeof updates.credentials === 'object' &&
      !Array.isArray(updates.credentials) &&
      Object.keys(updates.credentials).length > 0
    ) {
      const crypto = new CredentialsCrypto(SECRET_KEY);
      updates.credentials = JSON.stringify(crypto.encrypt(updates.credentials));
    }

    const accountPluginUpdates: Partial<AccountPluginInsert> = {
      credentials: updates.credentials,
      provider_id: providerId,
    };

    const billingUpdates: Partial<BillingAccountInsert> = {
      credentials: updates.credentials,
      updated_at: new Date().toISOString(),
      provider: updates.provider as BillingAccountInsert['provider'],
      account_id: updates.account_id,
      provider_id: providerId,
    };

    if (updates.provider === 'loom') {
      return await accountPluginRepository.updateLoom(id, accountPluginUpdates);
    } else {
      return await accountPluginRepository.update(
        id,
        accountPluginUpdates,
        billingUpdates,
      );
    }
  } catch (error) {
    throw new Error(
      `[SERVICE] Failed to update account plugin: ${(error as Error).message}`,
    );
  }
};

/**
 * @name updatePluginStatus
 * @description Service to update the status of an account_plugin in the `account_plugins` table.
 * @param {SupabaseClient<Database>} client - The Supabase client instance for database interactions.
 * @param {string} id - The unique ID of the `account_plugin` to update.
 * @param {"installed" | "uninstalled" | "failed" | "in progress" | null} status - The new status to set for the `account_plugin`.
 * @returns {Promise<void>} Resolves when the status is successfully updated.
 * @throws {Error} If the update operation fails.
 */
export const updatePluginStatus = async (
  client: SupabaseClient<Database>,
  id: string,
  status: 'installed' | 'uninstalled' | 'failed' | 'in progress' | null,
): Promise<void> => {
  try {
    const accountPluginRepository = new AccountPluginRepository(client);

    await accountPluginRepository.updateStatus(id, status);
  } catch (error) {
    throw new Error(
      `[SERVICE] Failed to update plugin status: ${(error as Error).message}`,
    );
  }
};

/**
 * @name deleteAccountPlugin
 * @description Service to delete an account_plugin and its corresponding billing_account.
 * Performs a soft delete operation for both tables.
 * @param {SupabaseClient<Database>} client - The Supabase client instance for database interactions.
 * @param {string} id - The unique ID of the account_plugin to delete.
 * @param {string} accountId - The ID of the account to identify the billing_account.
 * @param {string} provider - The provider name to identify the billing_account.
 * @returns {Promise<void>} Resolves when both records are successfully deleted.
 * @throws {Error} If any delete operation fails.
 */
export const deleteAccountPlugin = async (
  client: SupabaseClient<Database>,
  id: string,
  accountId: string,
  provider: string,
): Promise<void> => {
  try {
    const accountPluginRepository = new AccountPluginRepository(client);

    await accountPluginRepository.delete(id, accountId, provider);
  } catch (error) {
    throw new Error(
      `[SERVICE] Failed to delete account plugin and billing account: ${(error as Error).message}`,
    );
  }
};
