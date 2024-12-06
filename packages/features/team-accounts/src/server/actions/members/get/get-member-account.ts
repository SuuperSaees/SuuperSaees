'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Account } from '../../../../../../../../apps/web/lib/account.types';
import { Database } from '../../../../../../../../apps/web/lib/database.types';

// Helper function to fetch current user data
export async function fetchCurrentUser(client: SupabaseClient<Database>) {
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError) {
    throw new Error(`Error getting user data: ${userError.message}`);
  }
  return userData.user;
}
// organization_id, name, email, id, picture_url, primary_owner_user_id
type AccountGet = Pick<
  Account.Type,
  | 'organization_id'
  | 'name'
  | 'email'
  | 'id'
  | 'picture_url'
  | 'primary_owner_user_id'
> & { settings: { name: string | null } | null };
// Helper function to fetch the current user's account details
export async function fetchCurrentUserAccount(
  client: SupabaseClient<Database>,
  userId?: string,
) {
  try {
    let userIdToFound = userId;
    if (!userId) {
      userIdToFound = (await fetchCurrentUser(client)).id;
    }
    const { data: currentUserAccount, error: currentUserError } = await client
      .from('accounts')
      .select('organization_id, email, id, name, settings:user_settings(name)')
      .eq('id', userIdToFound ?? '')
      .eq('is_personal_account', true)
      .single();

    if (currentUserError) {
      throw new Error(
        `Error fetching current user account data: ${currentUserError.message}`,
      );
    }
    if (!currentUserAccount?.organization_id) {
      throw new Error('Current user account has no associated organization.');
    }

    return currentUserAccount;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function fetchUsersAccounts(
  client: SupabaseClient<Database>,
  ids: Account.Type['id'][],
) {
  try {
    // Fetch users accounts using their passed ids
    // The ids can match either id or organization_id
    const { data: usersAccounts, error: usersAccountsError } = await client
      .from('accounts')
      .select(
        'id, name, email, picture_url, settings:user_settings(name, picture_url)',
      )
      .or(`id.in.(${ids.join(',')}),organization_id.in.(${ids.join(',')})`)
      .eq('is_personal_account', true);

    if (usersAccountsError) {
      console.error('Error fetching users accounts:', usersAccountsError);
      throw new Error(
        `Error fetching users accounts: ${usersAccountsError.message}`,
      );
    }

    return usersAccounts;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getPrimaryOwnerId(): Promise<string | undefined> {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError;

    // first we get the user account
    const { data: userAccountData, error: userAccountError } = await client
      .from('accounts')
      .select('organization_id')
      .eq('id', userData.user?.id)
      .single();

    if (userAccountError)
      throw new Error(
        `Couldn't get the user account: ${userAccountError.message}`,
      );

    // we get the organization account in order to obtain the propietary
    const { data: orgnaizationAccountData, error: orgnaizationAccountError } =
      await client
        .from('accounts')
        .select('primary_owner_user_id')
        .eq('id', userAccountData?.organization_id ?? '')
        .single();

    if (orgnaizationAccountError)
      throw new Error(
        `Couldn't get the organization account: ${orgnaizationAccountError.message}`,
      );

    return orgnaizationAccountData.primary_owner_user_id; // don't change this line
  } catch (error) {
    console.error('Error fetching primary owner:', error);
    // throw error;
  }
}

export async function getUserIdOfAgencyOwner() {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: userData, error: userError } = await client.auth.getUser();

    if (userError) throw userError;

    const {
      data: accountMemberShipCurrentUserData,
      error: accountMemberShipCurrentUserError,
    } = await client
      .from('accounts_memberships')
      .select('account_id')
      .eq('user_id', userData.user.id)
      .single();

    if (accountMemberShipCurrentUserError)
      throw accountMemberShipCurrentUserError;

    return accountMemberShipCurrentUserData;
  } catch (error) {
    console.error('Error fetching Agency Owner User Id:', error);
  }
}

// get a given user

export async function getUserById(userId: string) {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userAuthenticatedError } = await client.auth.getUser();

    if (userAuthenticatedError) throw userAuthenticatedError;

    const { data: userData, error: userError } = await client
      .from('accounts')
      .select('name, email, id, picture_url, settings:user_settings(picture_url, name)') // add more fields to the user settings when needed
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    return userData;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export async function getUserRole() {
  try {
    const client = getSupabaseServerComponentClient();
    const userAuthenticatedData = await fetchCurrentUser(client);
    const userId = userAuthenticatedData?.id;

    const { data: userAccountData, error: userAccountError } = await client
      .from('accounts_memberships')
      .select('account_role')
      .eq('user_id', userId)
      .single();

    if (userAccountError) throw userAccountError;

    return userAccountData?.account_role;
  } catch (error) {
    console.error('Error fetching user role:', error);
    throw error;
  }
}

export async function getUserRoleById(userId: string, adminActivated = false) {
  try {
    const client = getSupabaseServerComponentClient({ admin: adminActivated });

    const { error: userAccountError, data: userAccountData } = await client
      .from('accounts_memberships')
      .select()
      .eq('user_id', userId)
      .maybeSingle();

    if (userAccountError) {
      throw new Error(
        `Error fetching the user role for ${userId}, ${userAccountError.message}`,
      );
    }

    return userAccountData?.account_role;
  } catch (error) {
    console.error('Error fetching user role:', error);
    throw error;
  }
}

export async function getStripeAccountID(): Promise<{
  userId: string;
  stripeId: string;
}> {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError;

    const { data: userAccountData, error: accountsError } = await client
      .from('accounts')
      .select()
      .eq('id', userData.user.id)
      .single();

    if (accountsError) throw accountsError;

    const stripeId = userAccountData?.stripe_id;

    return {
      stripeId: stripeId ?? '',
      userId: userData.user.id,
    };
  } catch (error) {
    console.error('Error fetching primary owner:', error);
    return {
      stripeId: '',
      userId: '',
    };
  }
}

export async function getUserAccountById(
  databaseClient: SupabaseClient<Database>,
  userId: Account.Type['id'],
): Promise<AccountGet | null> {
  try {
    // Fetch the user's account to check for an existing organization
    const { data: userAccount, error: userAccountError } = await databaseClient
      .from('accounts')
      .select(
        'organization_id, name, email, id, picture_url, primary_owner_user_id, settings:user_settings(name)',
      )
      .eq('id', userId)
      .eq('is_personal_account', true)
      .single();

    if (userAccountError) {
      throw new Error(userAccountError.message);
    }
    if (!userAccount?.organization_id) return null;

    return userAccount;
  } catch (error) {
    console.error('Error checking user organization:', error);
    throw error;
  }
}

export const getUserAccountByEmail = async (
  email: Account.Type['email'],
  databaseClient?: SupabaseClient<Database>,
  adminActivated = false,
) => {
  databaseClient =
    databaseClient ??
    getSupabaseServerComponentClient({
      admin: adminActivated,
    });
  try {
    if (!email) return null;
    const { data: userAccountData, error: clientAccountError } =
      await databaseClient
        .from('accounts')
        .select(
          'organization_id, name, email, id, picture_url, primary_owner_user_id',
        )
        .eq('email', email)
        .eq('is_personal_account', true)
        .single();

    if (clientAccountError && clientAccountError.code !== 'PGRST116') {
      throw new Error(
        `Error obtaining the user client account ${clientAccountError.message}`,
      );
    }

    if (!userAccountData?.organization_id) return null;

    return userAccountData;
  } catch (error) {
    console.error(
      'Error occurred while checking the existence of the user organization ',
      error,
    );
    throw error;
  }
};
