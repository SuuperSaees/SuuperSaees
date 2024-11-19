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
import { hasPermissionToReadAgencyClients } from '../../permissions/clients';
import { Client } from '../../../../../../../../apps/web/lib/client.types';

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
  | 'primary_owner_user_id'
>;

export type ClientsWithOrganization = {
  organization: Organization;
  primaryOwner: UserAccount | null;
  users: UserAccount[];
}

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
      .eq('organization_client_id', clientOrganizacionId)
      .is('deleted_on', null);
  } else if (clientRoles.includes(currentUserRole)) {
    clientsQuery = client
      .from('clients')
      .select('user_client_id')
      .eq('organization_client_id', currentUserOrganizationId)
      .is('deleted_on', null);
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

    return clientOrganizationMembers;
  } catch (error) {
    console.error('Error fetching client members:', error);
    throw error;
  }
}

// Helper function to fetch agency clients
export async function fetchAgencyClients(
  client: SupabaseClient<Database>,
  agencyId: string,
) {
  const { data: agencyClients, error: agencyClientsError } = await client
    .from('clients')
    .select()
    .eq('agency_id', agencyId)
    .is('deleted_on', null);

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
  clientsOrganizationIds: string[],
  clientUserIds: string[],
) {
  const { data: clientOrganizations, error: clientOrganizationsError } = await client
    .from('accounts')
    .select(
      'name, id, picture_url, created_at, primary_owner_user_id, is_personal_account, slug',
    )
    .in('id', clientsOrganizationIds)
    .eq('is_personal_account', false);

  if (clientOrganizationsError ) {
    throw new Error(
      `Error fetching client owners: ${clientOrganizationsError.message}`,
    );
  }

  const primaryOwnerIds = clientOrganizations.map((clientOrganization) => clientOrganization.primary_owner_user_id);

  const { data: clientOrganizationOwners, error: clientOwnersError } = await client
    .from('accounts')
    .select(
      'name, email, id, picture_url, organization_id, created_at, primary_owner_user_id, is_personal_account',
    )
    .in('id', primaryOwnerIds)
    .eq('is_personal_account', true);

    if (clientOwnersError) {
      throw new Error(
        `Error fetching client owners: ${clientOwnersError.message}`,
      );
    }

  const { data: clientUsers, error: clientUsersError } = await client 
    .from('accounts')
    .select(
      'name, email, id, picture_url, organization_id, created_at, primary_owner_user_id, is_personal_account',
    ).in('id', clientUserIds)
    .eq('is_personal_account', true);

    if (clientUsersError) {
      throw new Error(
        `Error fetching client users: ${clientUsersError.message}`,
      );
    }

    const clientOrganizationWithOwners = combineClientData(clientOrganizationOwners, clientOrganizations, clientUsers);
  

  return clientOrganizationWithOwners ?? [];
}

// Helper function to fetch client organizations
export async function fetchClientOrganizations(
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

  return clientOrganizations;
}

// Helper function to combine client owner data with organization data
// Helper function to combine client owner data with organization data
function combineClientData(
  clientOwners: UserAccount[],
  clientOrganizations: Organization[],
  clientUsers: UserAccount[],
) {
  // Map over each organization to attach its primary owner and associated users
  return clientOrganizations.map((organization) => {
    // Find the primary owner based on `primary_owner_user_id`
    const primaryOwner = clientOwners.find(
      (owner) => owner.id === organization.primary_owner_user_id
    );

    // Find additional users for this organization
    const users = clientUsers.filter(
      (user) => user.organization_id === organization.id
    );

    return {
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        picture_url: organization.picture_url,
        created_at: organization.created_at,
        is_personal_account: organization.is_personal_account,
        primary_owner_user_id: organization.primary_owner_user_id,
      },
      primaryOwner: primaryOwner
        ? {
            id: primaryOwner.id,
            name: primaryOwner.name,
            email: primaryOwner.email,
            picture_url: primaryOwner.picture_url,
            created_at: primaryOwner.created_at,
          }
        : null,
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        picture_url: user.picture_url,
        created_at: user.created_at,
        primary_owner_user_id: user.primary_owner_user_id,
      })),
    };
  });
}

// Main function to get all clients with owners and their organizations
export async function getAllClients(): Promise<ClientsWithOrganization[]> {
  try {
    const client = getSupabaseServerComponentClient();

    // Step 1: Fetch current user
    const userData = await fetchCurrentUser(client);

    // Step 2: Fetch the current user's account data
    const userAccountData = await fetchCurrentUserAccount(client, userData.id);

    // Step 3: Check permission to read agency clients
    const hasPermission = await hasPermissionToReadAgencyClients(
      userAccountData.organization_id ?? '',
    );
    if (!hasPermission) {
      throw new Error('You do not have permission to read agency clients');
    }

    // Step 4: Fetch agency clients
    const agencyClients = await fetchAgencyClients(
      client,
      userAccountData?.organization_id ?? '',
    );

    const clientOrganizationIds = agencyClients.map(
      (client) => client.organization_client_id,
    );
    const clientUserIds = agencyClients.map((client) => client.user_client_id);

    // Step 5: Fetch client owners and organizations


    // Step 6: Combine the data
    const clientsWithOrganizations = fetchClientOwners(client, clientOrganizationIds, clientUserIds);

    return clientsWithOrganizations;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
}

export async function fetchClientByOrgId(
  client: SupabaseClient<Database>,
  clientOrganizationId: string,
) {
  try {
    const { data: clientData, error: clientError } = await client
      .from('clients')
      .select('id, agency_id')
      .eq('organization_client_id', clientOrganizationId)
      .is('deleted_on', null);

    if (clientError) {
      throw new Error(
        `Error while trying to find the client, ${clientError.message}`,
      );
    }

    return clientData;
  } catch (error) {
    console.error('Error while trying to find the client:', error);
    throw error;
  }
}

// Get organizations of clients
export async function getClientsOrganizations() {
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

    // Step 4: Fetch client organizations
    const clientOrganizations = await fetchClientOrganizations(
      client,
      clientOrganizationIds,
    );
    return clientOrganizations;
  } catch (error) {
    console.error('Error fetching client organizations:', error);
    throw error;
  }
}

export async function fetchDeletedClients(client: SupabaseClient<Database>, agencyId: Client.Type['agency_id'], userId?: Client.Type['user_client_id']) {
  try {
    if (!userId) {
      const user = await fetchCurrentUser(client);
      userId = user.id;
    }

    const { data: notAllowedClient, error: clientError } = await client
    .from('clients')
    .select('user_client_id')
    .eq('user_client_id', userId)
    .eq('agency_id', agencyId)
    .not('deleted_on', 'is', null)
    .maybeSingle();

    if (clientError) {
      throw new Error(`Error fetching client: ${clientError.message}`);
    }

    return notAllowedClient;
  } catch (error) {
    console.error('Error fetching deleted clients:', error);
    throw error;
  }
}

export async function getUserByEmail(
  email: string,
  isAdminuser: boolean,
) {
  try {
    const client = getSupabaseServerComponentClient({ admin: isAdminuser });

    const { data: userData, error: userError } = await client
      .from('accounts')
      .select('id, email, organization_id')
      .eq('email', email)
      .single();

    if (userError ?? !userData) {
      return null;
    }

    const { data: clientId, error: clientError } = await client
      .from('clients')
      .select('id')
      .eq('user_client_id', userData.id)
      .single();


    if (clientError ?? !clientId) {
      return { userData, clientId: null };
    }

    return { userData, clientId };
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}
