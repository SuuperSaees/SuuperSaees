import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';
import { getEmbeds} from '../../../../../apps/web/app/server/actions/embeds/embeds.action'

/**
 * Class representing an API for interacting with user accounts.
 * @constructor
 * @param {SupabaseClient<Database>} client - The Supabase client instance.
 */
class AccountsApi {
  constructor(private readonly client: SupabaseClient<Database>) {}

  /**
   * @name getAccount
   * @description Get the account data for the given ID.
   * @param id
   */
  async getAccount(id: string) {
    const { data, error } = await this.client
      .from('accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * @name getAccountWorkspace
   * @description Get the account workspace data.
   */
  async getAccountWorkspace() {
    const { data, error } = await this.client
      .from('user_account_workspace')
      .select(`*`)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * @name loadUserAccounts
   * Load the user accounts.
   */
  async loadUserAccounts() {
    const { data: accounts, error } = await this.client
      .from('user_accounts')
      .select(
        `id, name, slug, picture_url, settings:organization_settings!left(*)`
      );

    if (error) {
      throw error;
    }

    if (!accounts || accounts.length === 0) {
      throw new Error('No user accounts found');
    }

    const uniqueEmbeds = await getEmbeds().catch((error) => {
      console.error('Error fetching unique embeds:', error);
      return [];
    });

    const logoUrl =
      accounts[0]?.settings?.find((setting) => setting.key === 'logo_url')
        ?.value ??
      accounts[0]?.picture_url ??
      '';

    return {
      id: accounts[0]?.id,
      name: accounts[0]?.name,
      slug: accounts[0]?.slug,
      picture_url: logoUrl,
      embeds: uniqueEmbeds,
    };
  }

  /**
   * @name getSubscription
   * Get the subscription data for the given user.
   * @param accountId
   */
  async getSubscription(accountId: string) {
    const response = await this.client
      .from('subscriptions')
      .select('*, items: subscription_items !inner (*)')
      .eq('account_id', accountId)
      .maybeSingle();

    if (response.error) {
      throw response.error;
    }

    return response.data;
  }

  /**
   * Get the orders data for the given account.
   * @param accountId
   */
  async getOrder(accountId: string) {
    const response = await this.client
      .from('orders')
      .select('*, items: order_items !inner (*)')
      .eq('account_id', accountId)
      .maybeSingle();

    if (response.error) {
      throw response.error;
    }

    return response.data;
  }

  /**
   * @name getCustomerId
   * Get the billing customer ID for the given user.
   * If the user does not have a billing customer ID, it will return null.
   * @param accountId
   */
  async getCustomerId(accountId: string) {
    const response = await this.client
      .from('billing_customers')
      .select('customer_id')
      .eq('account_id', accountId)
      .maybeSingle();

    if (response.error) {
      throw response.error;
    }

    return response.data?.customer_id;
  }
}

export function createAccountsApi(client: SupabaseClient<Database>) {
  return new AccountsApi(client);
}
