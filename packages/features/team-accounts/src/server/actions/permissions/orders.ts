import { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Database } from '../../../../../../../apps/web/lib/database.types';
import {
  fetchCurrentUser,
  fetchCurrentUserAccount,
} from '../members/get/get-member-account';
import { checkGeneralPermission } from './permissions';

export const hasPermissionToReadOrderDetails = async (
  message_order_id: number,
  message_order_propietary_organization_id: string,
  message_order_client_organization_id: string,
) => {
  try {
    const client = getSupabaseServerComponentClient();

    // Step 1: Fetch user and account data
    const user = await fetchCurrentUser(client);
    const account = await fetchCurrentUserAccount(client, user.id);
    if (!account.organization_id) return false;

    // Step 2: Check general permission
    const hasPermission = await checkGeneralPermission(
      client,
      user.id,
      account.organization_id,
      'messages.read',
    );

    // Step 3: Check for agency permission
    if (message_order_propietary_organization_id === account.organization_id) {
      const agencyPermission = await checkAgencyOrderPermissions(
        client,
        user.id,
        message_order_id,
      );
      if (agencyPermission) return true;
    }

    // Step 4: Check for client permission
    if (message_order_client_organization_id === account.organization_id) {
      return hasPermission;
    }

    return false;
  } catch (error) {
    console.error('Error checking permissions:', error);
    throw error;
  }
};

// Additional check for agency order permissions
const checkAgencyOrderPermissions = async (
  client: SupabaseClient<Database>,
  userId: string,
  orderId: number,
) => {
  const {
    data: agencyMemberAssignedToOrder,
    error: agencyOrderAssignationsError,
  } = await client
    .from('order_assignations')
    .select()
    .eq('agency_member_id', userId)
    .eq('order_id', orderId)
    .single();

  if (
    agencyOrderAssignationsError &&
    agencyOrderAssignationsError.code !== 'PGRST116'
  ) {
    throw new Error(
      `Error fetching agency order assignations: ${agencyOrderAssignationsError.message}`,
    );
  }

  return Boolean(agencyMemberAssignedToOrder);
};
