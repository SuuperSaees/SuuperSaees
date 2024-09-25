'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import {
  getAgencyForClient,
  getOrganizationById,
} from '../../organizations/get/get-organizations';
import { hasPermissionToDeleteClient } from '../../permissions/clients';

// Define la función handleDelete
export const deleteClient = async (clientId: string) => {
  try {
    const client = getSupabaseServerComponentClient();

    // Step 1: Get the client's account details (for permissions)
    const { data: clientAccount, error: clientAccountError } = await client
      .from('accounts')
      .select('organization_id')
      .eq('id', clientId)
      .single();

    if (clientAccountError ?? !clientAccount?.organization_id) {
      throw new Error(
        `Error fetching client account: ${clientAccountError?.message ?? 'No organization found'}`,
      );
    }
    // Step 2: Get the current user's account details
    const agencyAccount = await getAgencyForClient(
      clientAccount.organization_id,
    );

    if (!agencyAccount) {
      throw new Error('Error fetching agency account');
    }

    // Step 3: Get the client's organization details (for permissions)
    const clientOrganizationAccount = await getOrganizationById(
      clientAccount.organization_id,
    );

    const clientOrganizationId = clientAccount.organization_id;
    const agencyOrganizationId = agencyAccount.id;

    // Step 4: Check if the user has permission to delete the client
    const hasPermission = await hasPermissionToDeleteClient(
      agencyOrganizationId,
      clientOrganizationId,
      clientId,
      clientOrganizationAccount.primary_owner_user_id,
    );

    if (!hasPermission) {
      throw new Error('You do not have permission to delete this client');
    }

    // Step 5: Proceed to delete the client
    const { error: deleteError } = await client
      .from('clients')
      .delete()
      .eq('user_client_id', clientId)
      .eq('agency_id', agencyOrganizationId);

    if (deleteError) {
      throw new Error(`Error deleting the client, ${deleteError.message}`);
    }
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
};