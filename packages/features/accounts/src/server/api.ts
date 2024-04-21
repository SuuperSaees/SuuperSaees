import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';

/**
 * Class representing an API for interacting with user accounts.
 * @constructor
 * @param {SupabaseClient<Database>} client - The Supabase client instance.
 */
class AccountsApi {
  constructor(private readonly client: SupabaseClient<Database>) {}

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

  async loadUserAccounts() {
    const { data: accounts, error } = await this.client
      .from('user_accounts')
      .select(`name, slug, picture_url`);

    if (error) {
      throw error;
    }

    return accounts.map(({ name, slug, picture_url }) => {
      return {
        label: name,
        value: slug,
        image: picture_url,
      };
    });
  }

  /**
   * @name getSubscriptionData
   * Get the subscription data for the given user.
   * @param accountId
   */
  getSubscriptionData(accountId: string) {
    return this.client
      .from('subscriptions')
      .select('*, items: subscription_items !inner (*)')
      .eq('account_id', accountId)
      .maybeSingle()
      .then((response) => {
        if (response.error) {
          throw response.error;
        }

        return response.data;
      });
  }

  /**
   * Get the orders data for the given account.
   * @param accountId
   */
  getOrdersData(accountId: string) {
    return this.client
      .from('orders')
      .select('*, items: order_items !inner (*)')
      .eq('account_id', accountId)
      .maybeSingle()
      .then((response) => {
        if (response.error) {
          throw response.error;
        }

        return response.data;
      });
  }

  /**
   * @name getBillingCustomerId
   * Get the billing customer ID for the given user.
   * If the user does not have a billing customer ID, it will return null.
   * @param accountId
   */
  getBillingCustomerId(accountId: string) {
    return this.client
      .from('billing_customers')
      .select('customer_id')
      .eq('account_id', accountId)
      .maybeSingle()
      .then((response) => {
        if (response.error) {
          throw response.error;
        }

        return response.data?.customer_id;
      });
  }
}

export function createAccountsApi(client: SupabaseClient<Database>) {
  return new AccountsApi(client);
}
