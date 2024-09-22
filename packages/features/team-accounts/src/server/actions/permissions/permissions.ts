'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { getUserRole } from '../members/get/get-member-account';


export const hasPermissionToReadOrderDetails = async (
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

export const hasPermissionToReadOrders = async () => {
  const client = getSupabaseServerComponentClient();
  const { data: userData } = await client.auth.getUser();
  const userId = userData.user!.id;

  // Obtener el rol
  const { data: role, error: roleError } = await client
    .from('accounts_memberships')
    .select('account_role')
    .eq('user_id', userId)
    .single();

  if (roleError) {
    console.error(roleError.message);
    throw new Error('Error fetching user role');
  }

  const isClient =
    (role && role.account_role === 'client_owner') ||
    (role && role.account_role === 'client_member');
  
  const isTeamMember = role && role.account_role === 'agency_member';
  const isAgency = !isClient && !isTeamMember;

  let ordersData = [];

  if (isClient) {
    const { data: orderData, error: clientError } = await client
      .from('orders_v2')
      .select(
        '*, organization:accounts!client_organization_id(slug, name), customer:accounts!customer_id(name)'
      )
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (clientError) {
      console.error(clientError.message);
      throw clientError.message;
    }

    ordersData = orderData ?? [];
  } else if (isTeamMember) {
    const { data: orderAssignedData, error: orderAssignedError } = await client
      .from('order_assignations')
      .select('order_id')
      .eq('agency_member_id', userId);

    if (orderAssignedError) {
      console.error(orderAssignedError.message);
      throw orderAssignedError.message;
    }

    const { data: orderData, error: teamOwnerError } = await client
      .from('orders_v2')
      .select(
        `*, organization:accounts!client_organization_id(slug, name), 
        customer:accounts!customer_id(name), assigned_to:order_assignations(agency_member:accounts(id, name, email, picture_url))`
      )
      .in('id', orderAssignedData.map((assign) => assign.order_id))
      .order('created_at', { ascending: false });

    if (teamOwnerError) {
      console.error(teamOwnerError.message);
      throw teamOwnerError.message;
    }

    ordersData = orderData ?? [];
  } else if (isAgency) {
    const { data: agencyUserAccount, error: accountError } = await client
      .from('accounts')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (accountError) {
      console.error(accountError.message);
      throw accountError.message;
    }

    const { data: orderData, error: ownerError } = await client
      .from('orders_v2')
      .select(
        `*, organization:accounts!client_organization_id(slug, name), 
        customer:accounts!customer_id(name), assigned_to:order_assignations(agency_member:accounts(id, name, email, picture_url))`
      )
      .eq('agency_id', agencyUserAccount?.organization_id ?? '')
      .order('created_at', { ascending: false });

    if (ownerError) {
      console.error(ownerError.message);
      throw ownerError.message;
    }

    ordersData = orderData ?? [];
  }

  return ordersData;
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

  const role = await getUserRole();
  // There's an error on the policy for roles below owner as allow add for "same "hierarchy level when should be "equal or lower"
  // so add special condition
  if (role === 'agency_project_manager') {
    return true;
  } else {

    // check for general permission on the account, be either client or agency
    const { data: hasPermission, error: permissionError } = await client.rpc(
      'has_permission',
      {
        user_id: userId,
        account_id: accountId ?? '',
        permission_name: 'invites.manage',
      },
    );

    if (permissionError) {
      console.error('Error checking permission:', permissionError);
      throw new Error('The account has not permissions to MANAGE team members');
    }
  
    return hasPermission;
  }
};