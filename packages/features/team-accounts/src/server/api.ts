import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';

/**
 * Class representing an API for interacting with team accounts.
 * @constructor
 * @param {SupabaseClient<Database>} client - The Supabase client instance.
 */
export class TeamAccountsApi {
  constructor(private readonly client: SupabaseClient<Database>) {}

  /**
   * @name getAccountWorkspace
   * @description Get the account workspace data.
   * @param slug
   */
  async getAccountWorkspace(slug: string) {
    const accountPromise = this.client.rpc('team_account_workspace', {
      account_slug: slug,
    });

    const accountsPromise = this.client.from('user_accounts').select('*');

    const [
      accountResult,
      accountsResult,
      {
        data: { user },
      },
    ] = await Promise.all([
      accountPromise,
      accountsPromise,
      this.client.auth.getUser(),
    ]);

    if (accountResult.error) {
      return {
        error: accountResult.error,
        data: null,
      };
    }

    if (accountsResult.error) {
      return {
        error: accountsResult.error,
        data: null,
      };
    }

    if (!user) {
      return {
        error: new Error('User is not logged in'),
        data: null,
      };
    }

    const accountData = accountResult.data[0];

    if (!accountData) {
      return {
        error: new Error('Account data not found'),
        data: null,
      };
    }

    return {
      data: {
        account: accountData,
        accounts: accountsResult.data,
        user,
      },
      error: null,
    };
  }

  /**
   * @name hasPermission
   * @description Check if the user has permission to manage billing for the account.
   */
  async hasPermission(params: {
    accountId: string;
    userId: string;
    permission: Database['public']['Enums']['app_permissions'];
  }) {
    const { data, error } = await this.client.rpc('has_permission', {
      account_id: params.accountId,
      user_id: params.userId,
      permission_name: params.permission,
    });

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * @name getMembersCount
   * @description Get the number of members in the account.
   * @param accountId
   */
  async getMembersCount(accountId: string) {
    const { count, error } = await this.client
      .from('accounts_memberships')
      .select('*', {
        head: true,
        count: 'exact',
      })
      .eq('account_id', accountId);

    if (error) {
      throw error;
    }

    return count;
  }

  /**
   * @name getCustomerId
   * @description Get the billing customer ID for the given account.
   * @param accountId
   */
  async getCustomerId(accountId: string) {
    const { data, error } = await this.client
      .from('billing_customers')
      .select('customer_id')
      .eq('account_id', accountId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data?.customer_id;
  }
}

export function createTeamAccountsApi(client: SupabaseClient<Database>) {
  return new TeamAccountsApi(client);
}
