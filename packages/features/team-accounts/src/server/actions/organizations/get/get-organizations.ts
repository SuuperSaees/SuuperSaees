'use server';

import { SupabaseClient } from '@supabase/supabase-js';



import { Database } from '@kit/supabase/database';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



// import { OrganizationSettings } from '../../../../../../../../apps/web/lib/organization-settings.types';
import { hasPermissionToViewOrganization } from '../../permissions/organization';


export const getOrganizationSettings = async () => {
  try {
    const client = getSupabaseServerComponentClient();

    const sessionData = (await client.rpc('get_session')).data;
    const role = sessionData?.organization?.role;
    const organizationId = sessionData?.organization?.id;
    const agencyId = sessionData?.agency?.id;

    if (
      role !== 'agency_member' &&
      role !== 'agency_owner' &&
      role !== 'agency_project_manager' &&
      role !== 'super_admin' &&
      role !== 'custom-role'
    ) {

      const { data: organizationSettings, error: settingsError } = await client
        .from('organization_settings')
        .select()
        .eq('organization_id', agencyId ?? '');

      if (settingsError) {
        throw settingsError.message;
      }
      return organizationSettings;
    } else {
      const { data: organizationSettings, error: settingsError } = await client
        .from('organization_settings')
        .select()
        .eq('organization_id', organizationId ?? '');

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

export const getOrganizationSettingsByOrganizationId = async (
  organizationId: string,
  adminActived = false,
  values: string[] = [
    'theme_color',
    'logo_url',
    'sidebar_background_color',
    'language',
    'favicon_url',
    'sender_name',
    'sender_domain',
    'sender_email',
    'auth_card_background_color',
    'auth_section_background_color',
    'dashboard_url',
  ],
  client?: SupabaseClient<Database>,
): Promise<{ key: string; value: string }[]> => {
  client = client ?? getSupabaseServerComponentClient({ admin: adminActived });
  const { data: organizationSettings, error: settingsError } = await client
    .from('organization_settings')
    .select('key, value')
    .eq('organization_id', organizationId)
    .in('key', values);

  if (settingsError) {
    throw settingsError.message;
  }

  return organizationSettings;
};

export async function getOrganization(): Promise<{
  id: string;
  name: string | null;
  owner_id: string | null;
  slug: string | null;
  picture_url: string | null;
}> {
  try {
    const client = getSupabaseServerComponentClient();
    const organizationData = (await client.rpc('get_session')).data?.organization;
    const organizationId = organizationData?.id ?? '';

    const { data: organizationsData, error: organizationError } = await client
      .from('organizations')
      .select('picture_url')
      .eq('id', organizationId)
      .single();

    if (organizationError) {
      console.error('Error fetching organization:', organizationError);
      throw organizationError;
    }

    return {
      id: organizationId,
      picture_url: organizationsData?.picture_url ?? '',
      name: organizationData?.name ?? '',
      owner_id: organizationData?.owner_id ?? '',
      slug: organizationData?.slug ?? '',
    };
  } catch (error) {
    console.error('Error getting the organization:', error);
    throw error;
  }
}

export async function getOrganizationByUserId(
  userId?: string,
): Promise<{
  id: string;
  name: string;
  owner_id: string;
}> {
  try {
    const client = getSupabaseServerComponentClient();
    const sessionData = (await client.rpc('get_session')).data;

    if(!userId) {
      const organizationData = sessionData?.organization;
      return {
        id: organizationData?.id ?? '',
          name: organizationData?.name ?? '',
          owner_id: organizationData?.owner_id ?? '',
        };
    }

    const { data: clientData, error: clientError } = await client
      .from('clients')
      .select('organization_client_id')
      .eq('user_client_id', userId)
      .eq('agency_id', sessionData?.agency?.id ?? sessionData?.organization?.id ?? '')
      .single();

    if(clientError) {
      console.error('Warning fetching client:', clientError);
    }

    const organizationId = clientData?.organization_client_id ?? sessionData?.organization?.id ?? '';

    const { data: organizationData, error: organizationError } = await client
      .from('organizations')
      .select('id, name, owner_id')
      .eq('id', organizationId)
      .single();

    if(organizationError) {
      throw new Error(
        `Error getting the organization: ${organizationError.message}`,
      );
    }

    return {
      id: organizationData?.id ?? '',
      name: organizationData?.name ?? '',
      owner_id: organizationData?.owner_id ?? '',
    };
  } catch (error) {
    console.error('Error trying to get the organization by user id:', error);
    throw error;
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
      .select('id, name, primary_owner_user_id, slug, email, picture_url')
      .eq('is_personal_account', false);

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

export async function getOrganizationById(organizationId: string, client?: SupabaseClient<Database>, adminActivated = false) {
  client = client ?? getSupabaseServerComponentClient({
    admin: adminActivated,
  });

  try {

    // Step 1: Check if the user has permission to view the organization
    if (!adminActivated) {
    const hasPermission = await hasPermissionToViewOrganization(organizationId);
    if (!hasPermission) {
      throw new Error(
        'You do not have the required permissions to view this organization',
      );
    }
  }

    // Step 2: Fetch the organization data
    const { data: organizationData, error: clientOrganizationError } =
      await client
        .from('organizations')
        .select('id, name, owner_id, slug, picture_url')
        .eq('id', organizationId)
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

export async function getAgencyForClient() {
  try {
    const client = getSupabaseServerComponentClient();
    
    const sessionData = (await client.rpc('get_session')).data;
    const { data: agencyData, error: agencyError } = await client
      .from('organizations')
      .select('id, name, picture_url, slug')
      .eq('id', sessionData?.agency?.id ?? sessionData?.organization?.id ?? '')
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

export async function getAgencyForClientByUserId(): Promise<{
  id: string;
  name: string;
  primary_owner_user_id: string;
  loom_app_id: string | null;
}> {
  try {
    const client = getSupabaseServerComponentClient();
    const agencyData = (await client.rpc('get_session')).data?.agency

    return {
      id: agencyData?.id ?? '',
      name: agencyData?.name ?? '',
      primary_owner_user_id: agencyData?.owner_id ?? '',
      loom_app_id: null,
    };
  } catch (error) {
    console.error('Error trying to get the agency');
    throw error;
  }
}