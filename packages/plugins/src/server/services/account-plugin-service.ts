import { SupabaseClient } from '@supabase/supabase-js';

import { Database, Json } from '@kit/supabase/database';

import {
  CredentialsCrypto,
  EncryptedCredentials,
} from '../../../../../apps/web/app/utils/credentials-crypto';
import { AccountPlugin, AccountPluginInsert } from '../../types';
import { AccountPluginRepository } from '../repositories/account-plugin-repository';
import { validatePluginInsert } from '../utils/validations';
import { generateUUID } from '../utils/validations';

const SECRET_KEY = Buffer.from(process.env.CREDENTIALS_SECRET_KEY ?? '', 'hex');

/**
 * @name createAccountPlugin
 * @description Service to handle the creation of a new account_plugin.
 * Validates the input data and saves the account_plugin in the database.
 * @param {SupabaseClient<Database>} client - The Supabase client instance for database interactions.
 * @param {AccountPluginInsert} data - The data required to create an account_plugin.
 * @returns {Promise<AccountPlugin>} The created account_plugin.
 * @throws {Error} If the account_plugin creation fails.
 */
export const createAccountPlugin = async (
  client: SupabaseClient<Database>,
  data: AccountPluginInsert,
): Promise<AccountPlugin> => {
  try {
    const accountPluginRepository = new AccountPluginRepository(client);

    validatePluginInsert(data);

    if (!data.provider_id) {
      data.provider_id = generateUUID();
    }

    if (
      data.credentials &&
      typeof data.credentials === 'object' &&
      !Array.isArray(data.credentials) &&
      Object.keys(data.credentials).length > 0
    ) {
      const crypto = new CredentialsCrypto(SECRET_KEY);
      const encryptedCredentials: EncryptedCredentials = crypto.encrypt(
        data.credentials,
      );

      data.credentials = JSON.stringify(encryptedCredentials);
    } else if (data.credentials && typeof data.credentials === 'object') {
      data.credentials = null;
    } else if (data.credentials) {
      throw new Error(
        'Invalid credentials format. Expected a non-empty object.',
      );
    }

    return await accountPluginRepository.create(data);
  } catch (error) {
    console.error('Error creating account plugin:', error);
    throw new Error('Failed to create account plugin');
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
      throw new Error('Account plugin not found');
    }

    if (accountPlugin.credentials) {
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
        console.error('Error decrypting credentials:', error);
        throw new Error('Failed to decrypt account plugin credentials');
      }
    }

    return accountPlugin;
  } catch (error) {
    console.error('Error fetching account plugin by ID:', error);
    throw new Error('Failed to get account plugin by ID');
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
    console.error('Error fetching account plugins for account:', error);
    throw new Error('Failed to get account plugins for account');
  }
};

/**
 * @name updateAccountPlugin
 * @description Service to update the details of an existing account_plugin.
 * Applies the specified updates to the account_plugin in the database.
 * @param {SupabaseClient<Database>} client - The Supabase client instance for database interactions.
 * @param {string} id - The unique ID of the account_plugin to update.
 * @param {Partial<AccountPluginInsert>} updates
 * @param {Partial<AccountPluginInsert>} updates - The fields to update in the account_plugin.
 * @returns {Promise<AccountPlugin>} The updated account_plugin data.
 * @throws {Error} If the update operation fails.
 */
export const updateAccountPlugin = async (
  client: SupabaseClient<Database>,
  id: string,
  updates: Partial<AccountPluginInsert>,
): Promise<AccountPlugin> => {
  try {
    const accountPluginRepository = new AccountPluginRepository(client);


    if (
      updates.credentials &&
      typeof updates.credentials === 'object' &&
      !Array.isArray(updates.credentials) &&
      Object.keys(updates.credentials).length > 0
    ) {
      const crypto = new CredentialsCrypto(SECRET_KEY);
      updates.credentials = JSON.stringify(crypto.encrypt(updates.credentials));
    }

    return await accountPluginRepository.update(id, updates);
  } catch (error) {
    console.error('Error updating account plugin:', error);
    throw new Error('Failed to update account plugin');
  }
};

/**
 * @name deleteAccountPlugin
 * @description Service to delete an account_plugin by marking it as deleted in the database.
 * Performs a soft delete operation.
 * @param {SupabaseClient<Database>} client - The Supabase client instance for database interactions.
 * @param {string} id - The unique ID of the account_plugin to delete.
 * @returns {Promise<void>} Resolves when the account_plugin is successfully deleted.
 * @throws {Error} If the delete operation fails.
 */
export const deleteAccountPlugin = async (
  client: SupabaseClient<Database>,
  id: string,
): Promise<void> => {
  try {
    const accountPluginRepository = new AccountPluginRepository(client);

    await accountPluginRepository.delete(id);
  } catch (error) {
    console.error('Error deleting account plugin:', error);
    throw new Error('Failed to delete account plugin');
  }
};
