'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';


export const getOrganizationSettings = async () => {
  try {
    const client = getSupabaseServerComponentClient();

    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      console.error('User not found');
      return [];
    }

    const { data: accountData, error: accountError } = await client
      .from('accounts')
      .select()
      .eq('id', user.id)
      .single();

    if (accountError) {
      throw accountError.message;
    }

    const { data: organizationSettings, error: settingsError } = await client
      .from('organization_settings')
      .select()
      .eq('account_id', accountData.organization_id ?? '');

    if (settingsError) {
      throw settingsError.message;
    }

    return organizationSettings;
  } catch (error) {
    console.error('Error fetching organization settings:', error);
    throw error;
  }
};

export async function getOrganization() {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError;

    const { data: userAccountData, error: accountsError } = await client
      .from('accounts')
      .select('id, organization_id')
      .eq('id', userData.user.id)
      .single();

    if (accountsError) {
      console.error('Error fetching organization:', accountsError);
      throw accountsError;
    }

    const organizationId = userAccountData?.organization_id;

    if (!organizationId) {
      console.error('Organization ID is null');
      throw new Error('Organization ID is null');
    }

    const { data: organizationsData, error: organizationError } = await client
      .from('accounts')
      .select('id, name, primary_owner_user_id, slug, email, picture_url')
      .eq('id', organizationId)
      .single();

    if (organizationError) {
      console.error('Error fetching organization:', organizationError);
      throw organizationError;
    }

    return organizationsData;
  } catch (error) {
    console.error('Error fetching primary owner:', error);
  }
}

export async function getOrganizations() {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userError } = await client.auth.getUser();
    if (userError) throw userError;

    // Get all organizations
    const { data: organizationsData, error: organizationError } = await client
      .from('accounts')
      .select('id, name, primary_owner_user_id, slug, email, picture_url');

    if (organizationError) {
      console.error('Error fetching organizations:', organizationError);
      throw organizationError;
    }

    return organizationsData;
  } catch (error) {
    console.error('Error trying to get the organizations');
    throw error;
  }
}

// here a function to search organizations and limit the query => once the amount of organizations in production be higher