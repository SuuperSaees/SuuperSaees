'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Account } from '../../../../../../../../apps/web/lib/account.types';
import { Database } from '../../../../../../../../apps/web/lib/database.types';
import {
  fetchCurrentUser,
  fetchCurrentUserAccount,
  getUserRole,
} from '../../members/get/get-member-account';

// Helper function to fetch client members based on user role (agency or client)
type Organization = Pick<
  Account.Type,
  | 'id'
  | 'name'
  | 'primary_owner_user_id'
  | 'created_at'
  | 'is_personal_account'
  | 'slug'
  | 'picture_url'
>;
type UserAccount = Pick<
  Account.Type,
  | 'id'
  | 'name'
  | 'email'
  | 'created_at'
  | 'is_personal_account'
  | 'organization_id'
  | 'picture_url'
>;
async function fetchClientMembers(
  client: SupabaseClient<Database>,
  currentUserOrganizationId: string,
  currentUserRole: string,
  clientOrganizacionId: string,
  agencyRoles: string[],
  clientRoles: string[],
) {
  let clientsQuery;

  if (agencyRoles.includes(currentUserRole)) {
    clientsQuery = client
      .from('clients')
      .select('user_client_id')
      .eq('agency_id', currentUserOrganizationId)
      .eq('organization_client_id', clientOrganizacionId);
  } else if (clientRoles.includes(currentUserRole)) {
    clientsQuery = client
      .from('clients')
      .select('user_client_id')
      .eq('organization_client_id', currentUserOrganizationId);
  } else {
    throw new Error('User role is neither agency nor client.');
  }

  const { data: clientsData, error: clientsDataError } = await clientsQuery;
  if (clientsDataError) {
    throw new Error(`Error fetching client data: ${clientsDataError.message}`);
  }

  const clientsIds = clientsData.map((client) => client.user_client_id);

  const { data: clientAccounts, error: clientAccountsError } = await client
    .from('accounts')
    .select(
      'id, email, picture_url, name, organization_id, primary_owner_user_id, created_at, is_personal_account',
    )
    .in('id', clientsIds);

  if (clientAccountsError) {
    throw new Error(
      `Error fetching client accounts: ${clientAccountsError.message}`,
    );
  }

  return clientAccounts;
}

// Main function that uses the helper functions
export async function getClientMembersForOrganization(
  clientOrganizacionId?: string,
) {
  const client = getSupabaseServerComponentClient();
  const agencyRoles = [
    'agency_owner',
    'agency_member',
    'agency_project_manager',
  ];
  const clientRoles = ['client_owner', 'client_member'];

  try {
    // Step 1: Fetch current user data
    const user = await fetchCurrentUser(client);

    // Step 2: Fetch current user account information
    const currentUserAccount = await fetchCurrentUserAccount(client, user.id);

    // Step 3: Fetch the user role
    const currentUserRole = await getUserRole();

    // Step 4: Fetch client members based on user role (agency or client)
    if (!currentUserAccount.organization_id) {
      throw new Error('Current user account has no associated organization.');
    }
    const clientOrganizationMembers = await fetchClientMembers(
      client,
      currentUserAccount.organization_id,
      currentUserRole,
      clientOrganizacionId ?? '',
      agencyRoles,
      clientRoles,
    );

    console.log('clientOrganizationMembers', clientOrganizationMembers);
    return clientOrganizationMembers;
  } catch (error) {
    console.error('Error fetching client members:', error);
    throw error;
  }
}

// Helper function to fetch agency clients
async function fetchAgencyClients(
  client: SupabaseClient<Database>,
  agencyId: string,
) {
  const { data: agencyClients, error: agencyClientsError } = await client
    .from('clients')
    .select()
    .eq('agency_id', agencyId);

  if (agencyClientsError) {
    throw new Error(
      `Error fetching agency clients: ${agencyClientsError.message}`,
    );
  }

  return agencyClients ?? [];
}

// Helper function to fetch client owners based on user IDs
async function fetchClientOwners(
  client: SupabaseClient<Database>,
  clientUserIds: string[],
) {
  const { data: clientOwners, error: clientOwnersError } = await client
    .from('accounts')
    .select(
      'name, email, id, picture_url, organization_id, created_at, primary_owner_user_id, is_personal_account',
    )
    .in('id', clientUserIds);

  if (clientOwnersError) {
    throw new Error(
      `Error fetching client owners: ${clientOwnersError.message}`,
    );
  }

  return clientOwners ?? [];
}

// Helper function to fetch client organizations
async function fetchClientOrganizations(
  client: SupabaseClient<Database>,
  clientOrganizationIds: string[],
) {
  const { data: clientOrganizations, error: clientOrganizationsError } =
    await client
      .from('accounts')
      .select(
        'id, name, slug, picture_url, primary_owner_user_id, created_at, is_personal_account',
      )
      .in('id', clientOrganizationIds)
      .eq('is_personal_account', false);

  if (clientOrganizationsError) {
    throw new Error(
      `Error fetching client organizations: ${clientOrganizationsError.message}`,
    );
  }

  return clientOrganizations ?? [];
}

// Helper function to combine client owner data with organization data
function combineClientData(
  clientOwners: UserAccount[],
  clientOrganizations: Organization[],
) {
  return clientOwners.map((clientOwner) => {
    const organization = clientOrganizations.find(
      (org) => org.id === clientOwner.organization_id,
    );
    const organizationName = organization?.name ?? '';
    return { ...clientOwner, client_organization: organizationName };
  });
}

// Main function to get all clients with owners and their organizations
export async function getAllClients() {
  try {
    const client = getSupabaseServerComponentClient();

    // Step 1: Fetch current user
    const userData = await fetchCurrentUser(client);

    // Step 2: Fetch the current user's account data
    const userAccountData = await fetchCurrentUserAccount(client, userData.id);

    // Step 3: Fetch agency clients
    const agencyClients = await fetchAgencyClients(
      client,
      userAccountData?.organization_id ?? '',
    );

    const clientOrganizationIds = agencyClients.map(
      (client) => client.organization_client_id,
    );
    const clientUserIds = agencyClients.map((client) => client.user_client_id);

    // Step 4: Fetch client owners and organizations
    const [clientOwners, clientOrganizations] = await Promise.all([
      fetchClientOwners(client, clientUserIds),
      fetchClientOrganizations(client, clientOrganizationIds),
    ]);

    // Step 5: Combine the data
    const clientsWithOrganizations = combineClientData(
      clientOwners,
      clientOrganizations,
    );

    return clientsWithOrganizations;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
}
