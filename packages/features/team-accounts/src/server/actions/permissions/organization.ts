import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import {
  getUserRole,
} from '../members/get/get-member-account';

export const hasPermissionToViewOrganization = async (
  organizationId: string,
): Promise<boolean> => {
  const client = getSupabaseServerComponentClient();
  try {
    // Step 1: Fetch current user data
    const currentOrganizationId = (await client.rpc('get_current_organization_id')).data ?? '';

    // Step 2: Check the user role
    //   const validRoles = ['agency_owner', 'client_owner'];
    const userAccountRole = await getUserRole();

    // Step 3: If the user is a client owner, verify if they belong to the client organization
    if (userAccountRole === 'client_owner') {
      if (currentOrganizationId === organizationId) {
        return true; // Client owners can view their own organization
      } else {
        console.error(
          'Client owner is not authorized to view this organization',
        );
        return false;
      }
    }


    // Step 4: If the user is an agency owner, check if the organization belongs to their client
    if (userAccountRole === 'agency_owner' || userAccountRole === 'agency_project_manager') {
      // Check if the requested organization is managed by the user's agency
      const { data: agencyClients, error: agencyClientsError } = await client
        .from('clients')
        .select('organization_client_id')
        .eq('agency_id', currentOrganizationId);

      if (agencyClientsError) {
        console.error('Error fetching agency clients:', agencyClientsError);
        return false;
      }

      
      const clientOrganizationIds = agencyClients.map(
        (client) => client.organization_client_id,
      );

      if (clientOrganizationIds.includes(organizationId)) {
        return true; // Agency owners can view client organizations
      } else if(currentOrganizationId === organizationId){
        return true; // Agency owners can view their own organization
      } else {
        console.error(
          'Agency owner is not authorized to view this organization',
        );
        return false;
      }

    }

    // If the user doesn't have a valid role, deny access
    console.error('Invalid role:', userAccountRole);
    return false;
  } catch (error) {
    console.error('Error checking permission to view organization:', error);
    return false;
  }
};
