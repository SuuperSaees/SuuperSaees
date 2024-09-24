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

// Helper function to fetch the current user's account details
export async function fetchCurrentUserAccount(
  client: SupabaseClient<Database>,
  userId: string,
) {
  const { data: currentUserAccount, error: currentUserError } = await client
    .from('accounts')
    .select('organization_id')
    .eq('id', userId)
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
      .select('name, email, id, picture_url')
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
    const { error: userAuthenticatedError, data: userAuthenticatedData } =
      await client.auth.getUser();
    const userId = userAuthenticatedData?.user?.id;

    if (userAuthenticatedError ?? !userId) throw userAuthenticatedError;
    const { error: userAccountError, data: userAccountData } = await client
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

export async function getStripeAccountID() {
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

    const stripetId = userAccountData?.stripe_id;

    return stripetId;
  } catch (error) {
    console.error('Error fetching primary owner:', error);
  }
}

export async function getUserAccountById(
  databaseClient: SupabaseClient<Database>,
  userId: Account.Type['id'],
) {
  try {
    // Fetch the user's account to check for an existing organization
    const { data: userAccount, error: userAccountError } = await databaseClient
      .from('accounts')
      .select(
        'organization_id, name, email, id, picture_url, primary_owner_user_id',
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
  databaseClient: SupabaseClient<Database>,
  email: Account.Type['email'],
) => {
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