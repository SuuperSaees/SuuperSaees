'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

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

    const { data: accountsData, error: accountsError } = await client
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

    const { data: accountsData, error: accountsError } = await client
      .from('accounts')
      .select()
      .eq('id', userData.user.id)
      .single();

    if (accountsError) throw accountsError;

    const organizationId = accountsData?.organization_id;

    if (!organizationId) {
      throw new Error('Organization ID is null');
    }

    const { data: organizationsData, error: organizationsError } = await client
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
