import { SupabaseClient } from '@supabase/supabase-js';



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Database } from '../../../../../../../apps/web/lib/database.types';
import { fetchCurrentUser, fetchCurrentUserAccount, getUserRole } from '../members/get/get-member-account';
import { checkGeneralPermission } from './permissions';


export const hasPermissionToReadOrderDetails = async (
  orderId: number,
  orderPropietaryOrganizationId: string,
  orderClientOganization_id: string,
) => {
  try {
    const client = getSupabaseServerComponentClient();

    // Step 1: Fetch user, account data and user role
    const user = await fetchCurrentUser(client);
    const account = await fetchCurrentUserAccount(client, user.id);
    const userRole = await getUserRole();

    if (!account.organization_id) return false;

    // Step 2: Check general permission
    const hasPermission = await checkGeneralPermission(
      client,
      user.id,
      account.organization_id,
      'messages.read',
    );

    // Step 3: Check for agency permission
    if (
      (userRole === 'agency_owner' || userRole === 'agency_project_manager') &&
      account.organization_id === orderPropietaryOrganizationId
    ) {
      return true;
    }
    // Step 4: Check for agency member permissions
    if (orderPropietaryOrganizationId === account.organization_id) {
      const agencyPermission = await checkAgencyOrderPermissions(
        client,
        user.id,
        orderId,
      );
      if (agencyPermission) return true;
    }

    // Step 4: Check for client permission
    if (orderClientOganization_id === account.organization_id) {
      return hasPermission;
    }

    // Step 5: Check for follower permission
    const followerPermission = await checkFollowerOrderPermissions(
      client,
      user.id,
      orderId,
    );
    if (followerPermission) return true;

    return false;
  } catch (error) {
    console.error('Error checking permissions:', error);
    throw error;
  }
};
export const hasPermissionToCreateOrder = async (
  agencyId: string,
  clientOrganizationId: string,
): Promise<boolean> => {
  try {
    const client = getSupabaseServerComponentClient();

    // Step 1: Fetch user, account data, and user role
    const user = await fetchCurrentUser(client);
    const account = await fetchCurrentUserAccount(client, user.id);
    const userRole = await getUserRole() ?? '';

    if (!account.organization_id) return false;

    // Step 2: Check if the user is part of an agency and can create orders for the client
    if (
      ['agency_owner', 'agency_project_manager', 'agency_member'].includes(
        userRole,
      ) &&
      agencyId === account.organization_id
    ) {
      return true;
    }

    // Step 3: Check for client permissions to create orders
    if (
      ['client_owner', 'client_member'].includes(userRole) &&
      clientOrganizationId === account.organization_id
    ) {
      // const clientServicePermissions = await checkClientServiceOrderPermissions(
      //   client,
      //   clientOrganizationId,
      //   agencyId,
      // );
      // if (clientServicePermissions) {
        return true;
      // }
    }

    return false;
  } catch (error) {
    console.error('Error checking permissions to create order:', error);
    throw new Error('Error checking permissions to create order');
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

// Additional check for follower order permissions
const checkFollowerOrderPermissions = async (
  client: SupabaseClient<Database>,
  userId: string,
  orderId: number,
) => {
  try {
    const { data, error } = await client
      .from('order_followers')
      .select('order_id')
      .eq('order_id', orderId)
      .eq('client_member_id', userId)
      .single();

    if (error)
      throw new Error(
        `Error checking follower order permissions: ${error.message}`,
      );
    return data;
  } catch (error) {
    console.error(`Error checking follower order permissions: `, error);
    throw error;
  }
};