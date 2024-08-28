'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';


export const hasPermissionToReadOrders = async (
  message_order_id: number,
  message_order_propietary_organization_id: string,
  message_order_client_organization_id: string,
) => {
  try {
    // Only client members/owners of the order and agency members assigned to the order can interact

    const client = getSupabaseServerComponentClient();
    const { data: userData, error: userError } = await client.auth.getUser();

    if (userError) throw userError.message;

    const userId = userData.user.id;
    const { data: accountData, error: accountError } = await client
      .from('accounts')
      .select('id, organization_id')
      .eq('id', userId)
      .eq('is_personal_account', true)
      .single();

    if (accountError) throw accountError.message;
    const accountId = accountData.organization_id;

    // First check for general permission on the account, be either client or agency
    const { data: hasPermission, error: permissionError } = await client.rpc(
      'has_permission',
      {
        user_id: userId,
        account_id: accountId ?? '',
        permission_name: 'messages.read',
      },
    );
    console.log('hasPermission', hasPermission);
    if (permissionError) {
      console.error('Error checking permission:', permissionError);
      throw new Error('The account has not permissions to READ messages');
    }

    // Add extra security or specific permissions for the order and user
    let hasStrictPermission = false;

    // Restriction for agency team:
    let hasAgencyPermission = false;
    // The agency owner can read messages if the order was made to its organization
    if (message_order_propietary_organization_id === userData.user.id) {
      hasStrictPermission = true;
      hasAgencyPermission = hasPermission && hasStrictPermission;
      if (hasAgencyPermission) return hasAgencyPermission;
    }

    // The agency team members can read messages if they were assigned to the order
    const {
      data: agencyMemberAssignedToOrder,
      error: agencyOrderAssignationsError,
    } = await client
      .from('order_assignations')
      .select()
      .eq('agency_member_id', userData.user.id)
      .eq('order_id', message_order_id)
      .single();

    if (
      agencyOrderAssignationsError &&
      agencyOrderAssignationsError.code !== 'PGRST116'
    ) {
      console.error(
        'Error fetching agency order assignations:',
        agencyOrderAssignationsError,
      );
      throw agencyOrderAssignationsError.message;
    }

    if (agencyMemberAssignedToOrder) {
      hasStrictPermission = true;
      hasAgencyPermission = hasPermission && hasStrictPermission;
      if (hasAgencyPermission) return hasAgencyPermission;
    }

    // Restriction for client team:
    let hasClientPermission = false;

    // For the moment => all client users have permission
    if (message_order_client_organization_id === accountData.organization_id) {
      hasStrictPermission = true;
      hasClientPermission = hasPermission && hasStrictPermission;
      if (hasClientPermission) return hasClientPermission;
    }
  } catch (error) {
    console.error('Error checking permissions:', error);
    throw error;
  }
};

export const hasPermissionToAddTeamMembers = async () => {
  const client = getSupabaseServerComponentClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) throw userError.message;

  const userId = userData.user.id;
  const { data: accountData, error: accountError } = await client
    .from('accounts')
    .select('id, organization_id')
    .eq('id', userId)
    .eq('is_personal_account', true)
    .single();

  if (accountError) throw accountError.message;
  const accountId = accountData.organization_id;

  // First check for general permission on the account, be either client or agency
  const { data: hasPermission, error: permissionError } = await client.rpc(
    'has_permission',
    {
      user_id: userId,
      account_id: accountId ?? '',
      permission_name: 'invites.manage',
    },
  );
  console.log('hasPermission', hasPermission);

  if (permissionError) {
    console.error('Error checking permission:', permissionError);
    throw new Error('The account has not permissions to MANAGE team members');
  }

  return hasPermission;
};