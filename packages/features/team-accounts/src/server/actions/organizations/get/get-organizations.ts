'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { hasPermissionToViewOrganization } from '../../permissions/organization';

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

    const { data: roleData, error: roleError } = await client
      .from('accounts_memberships')
      .select('account_role')
      .eq('user_id', user.id)
      .single();

    if (roleError) {
      throw roleError.message;
    }

    if (
      roleData?.account_role !== 'agency_member' &&
      roleData?.account_role !== 'agency_owner' &&
      roleData?.account_role !== 'agency_project_manager' &&
      roleData?.account_role !== 'super_admin' &&
      roleData?.account_role !== 'custom-role'
    ) {
      const { data: agencyOwnerClient, error: agencyOwnerClientError } =
        await client
          .from('clients')
          .select('agency_id')
          .eq('user_client_id', user.id)
          .single();

      if (agencyOwnerClientError) {
        throw agencyOwnerClientError.message;
      }

      const { data: organizationSettings, error: settingsError } = await client
        .from('organization_settings')
        .select()
        .eq('account_id', agencyOwnerClient.agency_id ?? '');

      if (settingsError) {
        throw settingsError.message;
      }
      return organizationSettings;
    } else {
      const { data: organizationSettings, error: settingsError } = await client
        .from('organization_settings')
        .select()
        .eq('account_id', accountData.organization_id ?? '');

      if (settingsError) {
        throw settingsError.message;
      }

      return organizationSettings;
    }
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
      .select('organization_id')
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

export async function getOrganizationById(organizationId: string) {
  try {
    const client = getSupabaseServerComponentClient();

    // Step 1: Check if the user has permission to view the organization
    const hasPermission = await hasPermissionToViewOrganization(organizationId);
    if (!hasPermission) {
      throw new Error(
        'You do not have the required permissions to view this organization',
      );
    }

    // Step 2: Fetch the organization data
    const { data: organizationData, error: clientOrganizationError } =
      await client
        .from('accounts')
        .select('id, name, primary_owner_user_id, slug, email, picture_url')
        .eq('id', organizationId)
        .eq('is_personal_account', false)
        .single();

    if (clientOrganizationError) {
      throw new Error(
        `Error getting the organization, ${clientOrganizationError.message}`,
      );
    }

    return organizationData;
  } catch (error) {
    console.error('Error trying to get the organization details:', error);
    throw error;
  }
}

export async function getAgencyForClient(clientOrganizationId: string) {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userError } = await client.auth.getUser();
    if (userError) throw userError;

    //Getting the client agency_id
    const { data: clientData, error: clientError } = await client
      .from('clients')
      .select('agency_id')
      .eq('organization_client_id', clientOrganizationId);

    if (clientError ?? !clientData) {
      console.error('Error fetching agency:', clientError);
      throw clientError;
    }

    // Retriving the corresponding agency => include also the subdomain param on the future
    const { data: agencyData, error: agencyError } = await client
      .from('accounts')
      .select('id, name, email, picture_url')
      .eq('id', clientData[0]?.agency_id ?? '')
      .eq('is_personal_account', false)
      .single();

    if (agencyError ?? !agencyData) {
      console.error('Error fetching agency:', agencyError);
      throw agencyError;
    }

    return agencyData;
  } catch (error) {
    console.error('Error trying to get the agency');
  }
}