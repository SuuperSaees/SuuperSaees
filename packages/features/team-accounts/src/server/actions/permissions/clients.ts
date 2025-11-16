import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { fetchCurrentUser, fetchCurrentUserAccount, getUserRole } from '../members/get/get-member-account';


export const hasPermissionToCreateClientOrg = async (
  agencyOrganizationId: string,
): Promise<boolean> => {
  const client = getSupabaseServerComponentClient();
  try {
    // Step 1: Fetch current user data
    const currentUser = await fetchCurrentUser(client);
    const currentUserAccount = await fetchCurrentUserAccount(
      client,
      currentUser.id,
    );

    // Step 2: Check the user role
    const validRoles = ['agency_owner', 'agency_project_manager'];
    const userAccountRole = await getUserRole();

    // Validate role
    if (!validRoles.includes(userAccountRole ?? '')) {
      console.error('Invalid role: ', userAccountRole);
      return false;
    }

    // Step 3: Ensure the user belongs to the correct agency if they are an agency owner
    if (
      userAccountRole === 'agency_owner' &&
      currentUserAccount.organization_id !== agencyOrganizationId
    ) {
      console.error(
        `Unauthorized: Agency owner does not belong to the specified agency (ID: ${agencyOrganizationId})`,
      );
      return false;
    }

    // If all checks pass, return true
    return true;
  } catch (error) {
    console.error('Error checking permissions for creating client:', error);
    return false;
  }
};

export const hasPermissionToAddClientMembers = async (
  agencyOrganizationId: string,
  clientOrganizationId: string,
): Promise<boolean> => {
  const client = getSupabaseServerComponentClient();
  try {
    // Step 1: Fetch current user data
    const currentUser = await fetchCurrentUser(client);
    const currentUserAccount = await fetchCurrentUserAccount(
      client,
      currentUser.id,
    );

    // Step 2: Check the user role
    const validRoles = ['agency_owner', 'client_owner', 'agency_project_manager'];
    const userAccountRole = await getUserRole();

    // Check if the role is valid
    if (!validRoles.includes(userAccountRole ?? '')) {
      console.error('Invalid role: ', userAccountRole);
      return false;
    }

    // Step 3: Ensure the user belongs to the correct agency if they are an agency owner
    if (
      (userAccountRole === 'agency_owner' || userAccountRole === 'agency_project_manager') &&
      currentUserAccount.organization_id !== agencyOrganizationId
    ) {
      console.error(
        `Unauthorized: Agency owner does not belong to the specified agency (ID: ${agencyOrganizationId})`,
      );
      return false;
    }

    // Step 4: Ensure the user belongs to the correct client organization if they are a client owner
    if (
      userAccountRole === 'client_owner' &&
      currentUserAccount.organization_id !== clientOrganizationId
    ) {
      console.error(
        `Unauthorized: Client owner does not belong to the specified client organization (ID: ${clientOrganizationId})`,
      );
      return false;
    }

    // If all checks pass, return true
    return true;
  } catch (error) {
    console.error(
      'Error checking permissions for adding client members:',
      error,
    );
    return false; // Fail gracefully
  }
};

export const hasPermissionToDeleteClient = async (
  agencyOrganizationId: string,
  clientOrganizationId: string,
  clientId: string,
  removeClientOrganization?: boolean
): Promise<boolean> => {
  const client = getSupabaseServerComponentClient();

  try {
    // Step 1: Fetch current user data
    const currentUser = await fetchCurrentUser(client);
    const currentUserAccount = await fetchCurrentUserAccount(client, currentUser.id);
    
    const allowedRolesToDeleteMembers = new Set(['agency_owner', 'client_owner']);
    const userAccountRole = await getUserRole();

    // Step 2: Check for agency role if deleting an entire organization
    if (removeClientOrganization && userAccountRole !== 'agency_owner') {
      console.error('Only agency owners can delete an entire client organization');
      return false;
    }

    // Step 3: Ensure the user has the correct role for deleting individual clients
    if (!removeClientOrganization && !allowedRolesToDeleteMembers.has(userAccountRole ?? '')) {
      console.error('User does not have permission to delete individual clients');
      return false;
    }

    // Step 4: Ensure the user belongs to the correct agency if they are an agency owner
    if (userAccountRole === 'agency_owner' && currentUserAccount.organization_id !== agencyOrganizationId) {
      console.error(`Unauthorized: Agency owner does not belong to the specified agency (ID: ${agencyOrganizationId})`);
      return false;
    }

    // Step 5: Ensure the user belongs to the correct client organization if they are a client owner
    if (
      !removeClientOrganization &&
      userAccountRole === 'client_owner' &&
      currentUserAccount.organization_id !== clientOrganizationId
    ) {
      console.error(`Unauthorized: Client owner does not belong to the specified client organization (ID: ${clientOrganizationId})`);
      return false;
    }

    // Step 6: Prevent client_owner from deleting their own account
    if (!removeClientOrganization && userAccountRole === 'client_owner' && currentUser.id === clientId) {
      console.error('Client owners cannot delete their own accounts');
      return false;
    }

    // If all checks pass, return true
    return true;
  } catch (error) {
    console.error('Error checking permissions for deleting client:', error);
    return false;
  }
};

export const hasPermissionToReadAgencyClients = async (agencyOrganizationId: string): Promise<boolean> => {
  const client = getSupabaseServerComponentClient();
  try {
    // Step 1: Fetch current user data
    const currentUser = await fetchCurrentUser(client);
    const currentUserAccount = await fetchCurrentUserAccount(client, currentUser.id);
    
    // Step 2: Get the user role
    const userAccountRole = await getUserRole();
    
    // Step 3: Check if the user is an agency owner
    if (userAccountRole === 'agency_owner' || userAccountRole === 'agency_project_manager') {
      // Ensure the user belongs to the correct agency
      if (currentUserAccount.organization_id === agencyOrganizationId) {
        return true;
      }
    }

    // If the user is not an agency owner or doesn't belong to the agency
    return false;
  } catch (error) {
    console.error('Error checking permissions for reading agency clients:', error);
    return false; // Fail gracefully
  }
};