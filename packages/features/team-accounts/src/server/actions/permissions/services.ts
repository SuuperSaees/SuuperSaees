import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import {
  fetchCurrentUser,
  fetchCurrentUserAccount,
  getUserRole,
} from '../members/get/get-member-account';

export const hasPermissionToReadAgencyServices = async (
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

    // Step 2: Get the user role
    const userAccountRole = await getUserRole();

    // Step 3: Check if the user is an agency owner
    if (
      userAccountRole === 'agency_owner' ||
      userAccountRole === 'agency_project_manager'
    ) {
      // Ensure the user belongs to the correct agency
      if (currentUserAccount.organization_id === agencyOrganizationId) {
        return true;
      }
    }

    // If the user is not an agency owner/project_manager or doesn't belong to the agency
    return false;
  } catch (error) {
    console.error(
      'Error checking permissions for reading agency client services:',
      error,
    );
    return false; // Fail gracefully
  }
};

export const hasPermissionToReadClientServices = async (
  clientOrganizationId: string,
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
    const validRoles = [
      'agency_owner',
      'agency_project_manager',
      'client_owner',
      'client_member',
    ];
    const userAccountRole = await getUserRole();

    // Check if the role is valid
    if (!validRoles.includes(userAccountRole)) {
      console.error('Invalid role: ', userAccountRole);
      return false;
    }
    // Step 3: Check if the user is a client owner
    if (
      userAccountRole === 'client_owner' ||
      userAccountRole === 'client_member'
    ) {
      // Ensure the user belongs to the correct client organization
      if (currentUserAccount.organization_id === clientOrganizationId) {
        return true;
      }
    }

    // Step 4: Check if the user is a project manager or agency_owner for the client organization
    if (
      userAccountRole === 'agency_project_manager' ||
      userAccountRole === 'agency_owner'
    ) {
      // Check if the client organization matches the user's organization
      if (currentUserAccount.organization_id === agencyOrganizationId) {
        return true;
      }
    }

    // If the user is not a client owner or doesn't belong to the client organization
    return false;
  } catch (error) {
    console.error(
      'Error checking permissions for reading client services:',
      error,
    );
    return false; // Fail gracefully
  }
};

export const hasPermissionToAddClientServices = async (
  clientAgencyId: string,
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

    // Check if the role is valid
    if (!validRoles.includes(userAccountRole)) {
      console.error('Invalid role: ', userAccountRole);
      return false;
    }

    // Step 3: Ensure the user belongs to the correct agency if they are an agency owner
    if (
      userAccountRole === 'agency_owner' &&
      currentUserAccount.organization_id !== clientAgencyId
    ) {
      console.error(
        `Unauthorized: Agency owner does not belong to the specified agency (ID: ${clientAgencyId})`,
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

export const hasPermissionToAddAgencyServices = async (
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

    // Check if the role is valid
    if (!validRoles.includes(userAccountRole)) {
      console.error('Invalid role: ', userAccountRole);
      return false;
    }

    // Step 3: Ensure the user belongs to the correct client organization if they are a client owner
    if (currentUserAccount.organization_id !== agencyOrganizationId) {
      console.error(
        `Unauthorized: Client owner does not belong to the specified client organization (ID: ${agencyOrganizationId})`,
      );
      return false;
    }

    // If all checks pass, return true
    return true;
  } catch (error) {
    console.error(
      'Error checking permissions for adding agency members:',
      error,
    );
    return false; // Fail gracefully
  }
};

export const hasPermissionToDeleteAgencyService = async (
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

    // Check if the role is valid
    if (!validRoles.includes(userAccountRole)) {
      console.error('Invalid role: ', userAccountRole);
      return false;
    }

    // Step 3: Ensure the user belongs to the correct agency
    if (currentUserAccount.organization_id !== agencyOrganizationId) {
      console.error(
        `Unauthorized: User does not belong to the specified agency (ID: ${agencyOrganizationId})`,
      );
      return false;
    }

    // If all checks pass, return true
    return true;
  } catch (error) {
    console.error(
      'Error checking permissions for deleting agency service:',
      error,
    );
    return false; // Fail gracefully
  }
};

export const hasPermissionToDeleteClientService = async (
  clientAgencyId: string,
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

    // Check if the role is valid
    if (!validRoles.includes(userAccountRole)) {
      console.error('Invalid role: ', userAccountRole);
      return false;
    }

    // Step 3: Ensure the user belongs to the correct client organization
    if (currentUserAccount.organization_id !== clientAgencyId) {
      console.error(
        `Unauthorized: User does not belong to the specified client organization (ID: ${clientAgencyId})`,
      );
      return false;
    }

    // If all checks pass, return true
    return true;
  } catch (error) {
    console.error(
      'Error checking permissions for deleting client service:',
      error,
    );
    return false; // Fail gracefully
  }
};
