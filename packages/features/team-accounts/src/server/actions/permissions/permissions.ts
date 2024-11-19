'use server';

import { SupabaseClient } from '@supabase/supabase-js';



import { Database } from '@kit/supabase/database';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



// import { Database } from '../../../../../../../apps/web/lib/database.types';
import { getUserRole } from '../members/get/get-member-account';
import { Order } from '../../../../../../../apps/web/lib/order.types';


// Generic permission check
export const checkGeneralPermission = async (
  client: SupabaseClient<Database>,
  userId: string,
  accountId: string,
  permissionName:
    | 'roles.manage'
    | 'billing.manage'
    | 'settings.manage'
    | 'members.manage'
    | 'invites.manage'
    | 'tasks.write'
    | 'tasks.delete'
    | 'messages.write'
    | 'messages.read',
) => {
  const { data: hasPermission, error: permissionError } = await client.rpc(
    'has_permission',
    {
      user_id: userId,
      account_id: accountId ?? '',
      permission_name: permissionName,
    },
  );
  if (permissionError) {
    console.error('Permission error:', permissionError);
    throw new Error(`No permission for ${permissionName}`);
  }
  return hasPermission;
};


export const hasPermissionToReadOrders = async () => {
  const client = getSupabaseServerComponentClient();
  const { data: userData } = await client.auth.getUser();
  const userId = userData.user!.id;

  // Step 1: Get the user's role
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

  let ordersData: any[] = [];

  // Step 2: Fetch orders based on user role
  if (isClient) {
    const { data: orderData, error: clientError } = await client
      .from('orders_v2')
      .select(
        '*, organization:accounts!client_organization_id(slug, name), customer:accounts!customer_id(name)',
      )
      .eq('customer_id', userId)
      .is('deleted_on', null)
      .order('created_at', { ascending: false });

    if (clientError) {
      console.error(clientError.message);
      throw clientError.message;
    }

    ordersData = orderData ?? [];

    const { data: followerOrders, error: followerError } = await client
      .from('order_followers')
      .select('order_id')
      .eq('client_member_id', userId);

    if (followerError) {
      console.error(followerError.message);
      throw new Error('Error fetching follower orders');
    }

    if (followerOrders?.length > 0) {
      const followerOrderIds = new Set(followerOrders.map(order => order.order_id));
      const followerOrdersData: any[] = [];

      await Promise.all(
        Array.from(followerOrderIds).map(async (orderId) => {
          const { data: followerOrderData, error: followerOrderError } =
            await client
              .from('orders_v2')
              .select(
                '*, organization:accounts!client_organization_id(slug, name), customer:accounts!customer_id(name)',
              )
              .eq('id', orderId as number)
              .is('deleted_on', null)
              .maybeSingle();

          if (followerOrderError) {
            console.error(followerOrderError.message);
            throw new Error('Error fetching orders for followers');
          }

          if (followerOrderData) {
            followerOrdersData.push(followerOrderData);
          }
        }),
      );

      ordersData = [...ordersData, ...followerOrdersData];
    }
  } else if (isTeamMember) {
    const { data: orderAssignedData, error: orderAssignedError } = await client
      .from('order_assignations')
      .select('order_id')
      .eq('agency_member_id', userId);

    if (orderAssignedError) {
      console.error(orderAssignedError.message);
      throw orderAssignedError.message;
    }

    const orderIds = orderAssignedData.map(assign => assign.order_id);
    if (orderIds.length > 0) {
      const { data: orderData, error: teamOwnerError } = await client
        .from('orders_v2')
        .select(
          `*, organization:accounts!client_organization_id(slug, name), 
          customer:accounts!customer_id(name), assigned_to:order_assignations(agency_member:accounts(id, name, email, picture_url))`,
        )
        .in('id', orderIds)
        .is('deleted_on', null)
        .order('created_at', { ascending: false });

      if (teamOwnerError) {
        console.error(teamOwnerError.message);
        throw teamOwnerError.message;
      }

      ordersData = orderData ?? [];
    }
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
        customer:accounts!customer_id(name), assigned_to:order_assignations(agency_member:accounts(id, name, email, picture_url))`,
      )
      .eq('agency_id', agencyUserAccount?.organization_id ?? '')
      .is('deleted_on', null)
      .order('created_at', { ascending: false });

    if (ownerError) {
      console.error(ownerError.message);
      throw ownerError.message;
    }

    ordersData = orderData ?? [];
  }

  // Step 3: Collect all status_ids from orders
  const statusIds = Array.from(new Set(ordersData.map((order: Order.Type) => order.status_id as number).filter(Boolean)));

  // Step 4: Fetch all relevant statuses in one query
  const { data: statuses, error: statusesError } = await client
    .from('agency_statuses')
    .select('*')
    .in('id', statusIds);

  if (statusesError) {
    console.error(statusesError.message);
    throw new Error('Error fetching statuses');
  }

  // Step 5: Create a map of statuses for quick access
  const statusMap = new Map();
  statuses?.forEach(status => {
    statusMap.set(status.id, status);
  });

  // Step 6: Assign the status to each order
  ordersData.forEach(order => {
    order.statusData = statusMap.get(order.status_id) || null;
  });

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