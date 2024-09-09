'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';


export async function getPrimaryOwnerId() {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError;

    const { data: accountsData } = await client
      .from('accounts')
      .select()
      .eq('primary_owner_user_id', userData.user.id);

    const filteredAccounts = accountsData?.filter(
      (account) => account.id !== userData.user.id,
    );
    const accountIds = filteredAccounts?.map((account) => account.id) ?? [];

    if (accountIds.length > 0) {
      const firstAccountId = accountIds[0];

      return firstAccountId;
    }
    throw new Error('Error fetching primary owner');
  } catch (error) {
    console.error('Error fetching primary owner:', error);
    // throw error;
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

    const { data: accountsData , error: accountsError } = await client
      .from('accounts')
      .select()
      .eq('id', userData.user.id)
      .single();
    
    if (accountsError) throw accountsError;
    
    const stripetId = accountsData?.stripe_id;

    return stripetId;

  } catch (error) {
    console.error('Error fetching primary owner:', error);
  }
}

export async function getOrganizationName() {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError;

    const { data: accountsData , error: accountsError } = await client
      .from('accounts')
      .select()
      .eq('id', userData.user.id)
      .single();
    
    if (accountsError) throw accountsError;
    
    const organizationId = accountsData?.organization_id;

    if (!organizationId) {
      throw new Error('Organization ID is null');
    }

    const { data: organizationsData , error: organizationsError } = await client
      .from('accounts')
      .select()
      .eq('id', organizationId)
      .single();
    
    if (organizationsError) throw organizationsError;

    const organizationName = organizationsData?.name;

    return organizationName;

  } catch (error) {
    console.error('Error fetching primary owner:', error);
  }
}