import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import {
  fetchCurrentUser,
  fetchCurrentUserAccount,
  getUserRole,
} from '../members/get/get-member-account';

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
    const validRoles = ['agency_owner'];
    const userAccountRole = await getUserRole();

    // Validate role
    if (!validRoles.includes(userAccountRole)) {
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
    const validRoles = ['agency_owner', 'client_owner'];
    const userAccountRole = await getUserRole();

    // Check if the role is valid
    if (!validRoles.includes(userAccountRole)) {
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
