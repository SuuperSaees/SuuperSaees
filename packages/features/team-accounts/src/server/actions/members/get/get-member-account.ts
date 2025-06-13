'use server';

import { SupabaseClient } from '@supabase/supabase-js';



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Account } from '../../../../../../../../apps/web/lib/account.types';
import { Database } from '../../../../../../../../apps/web/lib/database.types';
import { getSession, revalidateSession } from '../../../../../../../../apps/web/app/server/actions/accounts/accounts.action';

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
  | 'name'
  | 'email'
  | 'id'
  | 'picture_url'
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
      .select('email, id, name, settings:user_settings(name)')
      .eq('id', userIdToFound ?? '')
      .single();

    if (currentUserError) {
      throw new Error(
        `Error fetching current user account data: ${currentUserError.message}`,
      );
    }
    const organizationId = (await client.rpc('get_current_organization_id')).data;

    return {
      ...currentUserAccount,
      organization_id: organizationId ?? '',
    };
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

export async function getPrimaryOwnerId(
  client?: SupabaseClient<Database>,
  revalidate = false,
): Promise<string | undefined> {
  try {
     // don't change this line
     if(revalidate){
      await revalidateSession();
     }
    const ownerId = (await getSession())?.organization?.owner_id;
    return ownerId as string;
  } catch (error) {
    console.error('Error fetching primary owner:', error);
    // throw error;
  }
}

export async function getUserIdOfAgencyOwner() {
  try {
    // const client = getSupabaseServerComponentClient();

    return (await getSession())?.organization?.owner_id as string;
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

    return {
      ...userData,
      name: userData?.settings?.[0]?.name ?? userData?.name,
      picture_url: userData?.settings?.[0]?.picture_url ?? userData?.picture_url,
      settings: userData?.settings?.[0],
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export async function getUserRole() {
  try {
    const client = getSupabaseServerComponentClient();
    return (await client.rpc('get_current_role')).data;
  } catch (error) {
    console.error('Error fetching user role:', error);
    throw error;
  }
}

export async function getUserRoleById(userId: string, adminActivated = false, client?: SupabaseClient<Database>) {
  try {
   
    client = client ?? getSupabaseServerComponentClient({ admin: adminActivated });
    if(!adminActivated) {
      return (await client.rpc('get_current_role')).data;
    }

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
    console.error('Error fetching user role by id:', error);
    throw error;
  }
}

export async function getStripeAccountID(primaryOwnerId?: string, adminActivated = false): Promise<{
  userId: string;
  stripeId: string;
}> {
  try {
    const client = getSupabaseServerComponentClient({
      admin: adminActivated,
    });
    let userId = '';

    if(!adminActivated) {
      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError) throw userError;
      userId = userData.user.id;
    }

    const { data: userAccountData, error: accountsError } = await client
      .from('billing_accounts')
      .select('provider_id')
      .eq('account_id', primaryOwnerId ?? userId)
      .eq('provider', 'stripe')
      .single();

    if (accountsError) throw accountsError;

    const stripeId = userAccountData?.provider_id;
    return {
      stripeId: stripeId ?? '',
      userId: userId,
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
): Promise<AccountGet & { organization_id: string, primary_owner_user_id: string }> {
  try {
    // Fetch the user's account to check for an existing organization
    const { data: userAccount, error: userAccountError } = await databaseClient
      .from('accounts')
      .select(
        'name, email, id, picture_url',
      )
      .eq('id', userId)
      .single();

    if (userAccountError) {
      throw new Error(userAccountError.message);
    }
    const organizationData = (await getSession())?.organization;
    const organizationId = organizationData?.id ?? null;
    const primaryOwnerId = organizationData?.owner_id ?? null;

    let userSettings = null;
    const { data: settingsData, error: userSettingsError } = await databaseClient
      .from('user_settings')
      .select('name')
      .eq('user_id', userId)
      .eq('organization_id', organizationId ?? '')
      .single();

    if (userSettingsError) {
      console.error('Error fetching user settings:', userSettingsError);
      userSettings = null;
    } else {
      userSettings = settingsData;
    };

    return {
      organization_id: organizationId ?? '',
      primary_owner_user_id: primaryOwnerId ?? '',
      name: userAccount.name,
      email: userAccount.email,
      id: userAccount.id,
      picture_url: userAccount.picture_url,
      settings: userSettings
    };

  } catch (error) {
    console.error('Error checking user organization:', error);
    throw error;
  }
}

export const getUserAccountByEmail = async (
  email: Account.Type['email'],
  databaseClient?: SupabaseClient<Database>,
  adminActivated = false,
  agencyId?: string,
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
          'name, email, id, picture_url, settings:user_settings(name)',
        )
        .eq('email', email)
        .single();

    if (clientAccountError && clientAccountError.code !== 'PGRST116') {
      throw new Error(
        `Error obtaining the user client account ${clientAccountError.message}`,
      );
    }

    let organizationId = null;
    let primaryOwnerId = null;

    if(agencyId) {
      const { data: organizationClientData, error: organizationClientError } = await databaseClient
        .from('clients')
        .select('organization_client_id')
        .eq('id', agencyId)
        .single();

      if(organizationClientError && organizationClientError.code !== 'PGRST116') throw organizationClientError;

      organizationId = organizationClientData?.organization_client_id ?? null;
      
      const { data: organizationData, error: organizationError } = await databaseClient
        .from('organizations')
        .select('owner_id')
        .eq('id', organizationId ?? '')
        .single();

      if(organizationError && organizationError.code !== 'PGRST116') throw organizationError;

      primaryOwnerId = organizationData?.owner_id ?? null;
    }

    return {
      ...userAccountData,
      organization_id: organizationId ?? '',
      primary_owner_user_id: primaryOwnerId ?? '',
    };
  } catch (error) {
    console.error(
      'Error occurred while checking the existence of the user organization ',
      error,
    );
    throw error;
  }
};