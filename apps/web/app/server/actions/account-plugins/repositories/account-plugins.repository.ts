import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { AccountPlugin, AccountPluginInsert, BillingAccountInsert } from '~/lib/plugins.types'; 
import { getSession } from '../../accounts/accounts.action';

export class AccountPluginsRepository {
    private client: SupabaseClient<Database>
    private adminClient?: SupabaseClient<Database>
    private readonly tableName = 'account_plugins';

    constructor(client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
        this.client = client;
        this.adminClient = adminClient;
    }

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
            provider_id: accountPlugin.provider_id ?? null,
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
        billingAccount &&
        billingAccount.provider === 'stripe' ||
        billingAccount.provider === 'treli'
      ) {
        const { error: billingError } = await this.client
          .from('billing_accounts')
          .upsert(
            {
              ...billingAccount,
              provider_id: billingAccount.provider_id ?? null,
              account_id: billingAccount.account_id
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
   * @name get
   * @description Fetches account_plugins by ID or account ID.
   * When fetching by ID, returns a single account_plugin.
   * When fetching by account ID, supports pagination and returns an array.
   * Ensures account_plugins are not marked as deleted.
   * @param {Object} params - The query parameters
   * @param {string} [params.id] - The unique ID of the account_plugin to fetch
   * @param {string} [params.accountId] - The account ID to fetch account_plugins for
   * @param {number} [params.limit=10] - The maximum number of account_plugins to fetch (only for accountId)
   * @param {number} [params.offset=0] - The number of account_plugins to skip (only for accountId)
   * @returns {Promise<AccountPlugin | AccountPlugin[]>} Single account plugin or array depending on query type
   * @throws {Error} If the fetch operation fails or invalid parameters are provided
   */
  async get({
    id,
    name,
  }: {
    id?: string;
    name?: string;
  }): Promise<AccountPlugin> {
    try {
      const query = this.client
        .from(this.tableName)
        .select(`
          id,
          plugin_id,
          account_id,
          provider_id,
          status,
          credentials,
          created_at,
          updated_at,
          deleted_on,
          plugins(id, name)
        `)
        .is('deleted_on', null);

      if (name) {
        const sessionData = await getSession();
        const accountId = sessionData?.agency?.owner_id ?? sessionData?.organization?.owner_id ?? '';

        const { data: dataPlugin, error: errorPlugin } = await this.client
        .from('plugins')
        .select('id')
        .eq('name', name)
        .single();

        if (errorPlugin) {
          throw new Error(
            `[REPOSITORY] Error fetching plugin by name: ${errorPlugin.message}`,
          );
        }

        const { data, error } = await query
        .eq('account_id', accountId)
        .eq('plugin_id', dataPlugin?.id)
        .single();

        if (error) {
          throw new Error(
            `[REPOSITORY] Error fetching account plugin by ID: ${error.message}`,
          );
        }
        
        return data as AccountPlugin;
      }

      if (id) {
        const { data, error } = await query.eq('id', id).single();
        
        if (error) {
          throw new Error(
            `[REPOSITORY] Error fetching account plugin by ID: ${error.message}`,
          );
        }

        return data as AccountPlugin;
      }
      
      throw new Error('[REPOSITORY] Either id or accountId must be provided');
    } catch (error) {
      throw new Error(
        `[REPOSITORY] Error in get method: ${(error as Error).message}`,
      );
    }
  }

    async list(accountId: string, limit= 10, offset= 0): Promise<AccountPlugin[]> {
      try {
        const query = this.client
        .from(this.tableName)
        .select(`
          id,
          plugin_id,
          account_id,
          provider_id,
          status,
          credentials,
          created_at,
          updated_at,
          deleted_on
        `)
        .eq('account_id', accountId)
        .is('deleted_on', null)
        .range(offset, offset + limit - 1);

        const { data, error } = await query;

        if (error) {
          throw new Error(
            `[REPOSITORY] Error fetching account plugins: ${error.message}`,
          );
        }

        return data as AccountPlugin[];
      } catch (error) {
        throw new Error(
          `[REPOSITORY] Error in list method: ${(error as Error).message}`,
        );
      }
    }


  /**
   * @name update
   * @description Updates an account_plugin and optionally its billing_account (excluding `loom`).
   * Can also update just the status of the account_plugin.
   * @param {string} id - The unique ID of the account_plugin to update.
   * @param {Partial<AccountPluginInsert> | { status: 'installed' | 'uninstalled' | 'failed' | 'in progress' | null }} updates - The fields to update
   * @param {Partial<BillingAccountInsert>} [billingUpdates] - Optional fields to update in the billing_account.
   * @returns {Promise<AccountPlugin>} The updated account_plugin data.
   * @throws {Error} If the update operation fails.
   */
  async update(
    id: string,
    updates: Partial<AccountPluginInsert> | { status: 'installed' | 'uninstalled' | 'failed' | 'in progress' | null },
    billingUpdates?: Partial<BillingAccountInsert>,
  ): Promise<AccountPlugin> {
    try {

      const { data: pluginData, error: pluginError } = await this.client
        .from(this.tableName)
        .update({
          ...updates,
          provider_id: 'provider_id' in updates ? updates.provider_id ?? undefined : undefined,
        })
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

      if (billingUpdates?.account_id && billingUpdates?.provider) {
        const { error: billingError } = await this.client
          .from('billing_accounts')
          .upsert(
            {
              account_id: billingUpdates.account_id,
              provider: billingUpdates.provider,
              credentials: billingUpdates.credentials ?? null,
              updated_at: billingUpdates.updated_at ?? new Date().toISOString(),
              provider_id: billingUpdates.provider_id ?? undefined,
            },
            {
              onConflict: 'account_id,provider',
            },
          );

        if (billingError) {
          throw new Error(
            `[REPOSITORY] Error upserting billing account: ${billingError.message}`,
          );
        }
      }

      return pluginData as AccountPlugin;
    } catch (error) {
      throw new Error(
        `[REPOSITORY] Error in update method: ${(error as Error).message}`,
      );
    }
  }

  /**
   * @name delete
   * @description Marks an account_plugin and its corresponding billing_account as deleted by updating their 'deleted_on' fields.
   * Performs a soft delete operation for both tables.
   * @param {string} id - The unique ID of the account_plugin to delete.
   * @param {string} accountId - The account ID to identify the billing_account.
   * @param {string} provider - The provider name to identify the billing_account.
   * @returns {Promise<void>} Resolves when both records are successfully marked as deleted.
   * @throws {Error} If any delete operation fails.
   */
  async delete(id: string, accountId: string, provider: string): Promise<void> {
    try {
      const { error: pluginError } = await this.client
        .from(this.tableName)
        .update({ deleted_on: new Date().toISOString() })
        .eq('id', id)
        .is('deleted_on', null);

      if (pluginError) {
        throw new Error(
          `[REPOSITORY] Error deleting account plugin: ${pluginError.message}`,
        );
      }

      if (provider !== 'loom' && provider !== 'embeds') {
        const { error: billingError } = await this.client
          .from('billing_accounts')
          .update({
            deleted_on: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('account_id', accountId)
          .eq('provider', provider);

        if (billingError && billingError.code !== 'PGRST116') {
          throw new Error(
            `[REPOSITORY] Error deleting billing account: ${billingError.message}`,
          );
        }
      }
    } catch (error) {
      throw new Error(
        `[REPOSITORY] Error in delete method: ${(error as Error).message}`,
      );
    }
  }

  /**
   * @name getProviderId
   * @description Busca el provider_id en las tablas account_plugins y billing_accounts según los parámetros dados.
   * @param {string} id - ID del account_plugin para buscar en la tabla account_plugins.
   * @param {string} [provider] - Nombre del proveedor para buscar en la tabla billing_accounts.
   * @param {string} [account_id] - ID de la cuenta para buscar en billing_accounts.
   * @returns {Promise<string | null>} - El provider_id encontrado o null si no existe.
   * @throws {Error} - Si ocurre un error durante la búsqueda.
   */
  async getProviderId(
    id: string,
    provider?: string,
    account_id?: string,
  ): Promise<string | null> {
    try {
      const { data: accountPlugin, error: accountError } = await this.client
        .from('account_plugins')
        .select('provider_id')
        .eq('id', id)
        .is('deleted_on', null)
        .single();

      if (accountError) {
        throw new Error(
          `[REPOSITORY] Error fetching provider_id from account_plugins: ${accountError.message}`,
        );
      }
      if (accountPlugin?.provider_id) {
        return accountPlugin.provider_id;
      }

      if (provider === 'loom') {
        return null;
      }

      if (!provider || !account_id) {
        throw new Error(
          `[REPOSITORY] Missing required parameters: provider or account_id.`,
        );
      }

      const { data: billingAccount, error: billingError } = await this.client
        .from('billing_accounts')
        .select('provider_id')
        .eq('account_id', account_id)
        .eq('provider', provider)
        .is('deleted_on', null)
        .single();

      if (billingError) {
        throw new Error(
          `[REPOSITORY] Error fetching provider_id from billing_accounts: ${billingError.message}`,
        );
      }

      if (billingAccount?.provider_id) {
        return billingAccount.provider_id;
      }

      return null;
    } catch (error) {
      throw new Error(
        `[REPOSITORY] Error in getProviderId method: ${(error as Error).message}`,
      );
    }
  }

  async updateLoom(
    id: string,
    updates: Partial<AccountPluginInsert>,
  ): Promise<AccountPlugin> {
    try {
      const { data: pluginData, error: pluginError } = await this.client
        .from(this.tableName)
        .update({
          ...updates,
          provider_id: updates.provider_id ?? undefined,
        })
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
}
