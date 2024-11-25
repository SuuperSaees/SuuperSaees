'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import {
  CustomError,
  CustomResponse,
  ErrorOrderOperations,
} from '@kit/shared/response';
import { Database } from '@kit/supabase/database';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Order } from '../../../../../../../../apps/web/lib/order.types';
import { User as ServerUser } from '../../../../../../../../apps/web/lib/user.types';
import { HttpStatus } from '../../../../../../../shared/src/response/http-status';
import {
  fetchBriefs,
  fetchBriefsResponsesforOrders,
} from '../../briefs/get/get-brief';
import {
  fetchCurrentUserAccount,
  getUserRole,
} from '../../members/get/get-member-account';
import { hasPermissionToReadOrderDetails } from '../../permissions/orders';
import { hasPermissionToReadOrders } from '../../permissions/permissions';

export const getOrderById = async (orderId: Order.Type['id']) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userError } = await client.auth.getUser();
    if (userError) throw userError.message;

    const { data: orderData, error: orderError } = await client
      .from('orders_v2')
      .select(
        `*, client:accounts!customer_id(id, name, email, picture_url, organization_id, created_at), 
        messages(*, user:accounts(id, name, email, picture_url), files(*)), 
        activities(*, user:accounts(id, name, email, picture_url)),
          reviews(*, user:accounts(id, name, email, picture_url)), 
          files(*, user:accounts(id, name, email, picture_url)),
         assigned_to:order_assignations(agency_member:accounts(id, name, email, picture_url)),
         followers:order_followers(client_follower:accounts(id, name, email, picture_url))
        `,
      )
      .eq('id', orderId)
      .single();

    const userHasReadMessagePermission = await hasPermissionToReadOrderDetails(
      orderId,
      orderData?.agency_id ?? '',
      orderData?.client_organization_id ?? '',
    );

    if (!userHasReadMessagePermission) throw 'Unauthorized access to order';

    if (orderError) throw orderError.message;

    // fetch client organization with the order
    const { data: clientOrganizationData, error: clientOrganizationError } =
      await client
        .from('accounts')
        .select('name, slug')
        .eq('id', orderData.client_organization_id)
        .single();

    if (clientOrganizationError) throw clientOrganizationError.message;

    const proccesedData = {
      ...orderData,
      messages: orderData.messages.map((message) => {
        return {
          ...message,
          user: message.user,
        };
      }),
      client_organization: clientOrganizationData,
    };

    return proccesedData as Order.Relational;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export async function getOrderAgencyMembers(
  agencyId: ServerUser.Type['organization_id'],
  orderId: Order.Type['id'],
) {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userAuthenticatedError, data: userAuthenticatedData } =
      await client.auth.getUser();

    if (userAuthenticatedError) throw userAuthenticatedError;
    const userId = userAuthenticatedData?.user?.id;

    // Retrieve authenticated account information
    const { data: accountData, error: accountError } = await client
      .from('accounts')
      .select('organization_id, primary_owner_user_id')
      .eq('id', userId)
      .single();

    if (accountError) throw accountError;

    const { data: accountMembershipsData, error: accountMembershipsDataError } =
      await client
        .from('accounts_memberships')
        .select('account_role')
        .eq('user_id', userId)
        .single();

    if (accountMembershipsDataError) throw accountMembershipsDataError;

    // Retrieve the order
    const { data: orderData, error: orderError } = await client
      .from('orders_v2')
      .select()
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    if (
      accountMembershipsData.account_role &&
      accountMembershipsData.account_role !== 'agency_project_manager' &&
      accountMembershipsData.account_role !== 'agency_owner' &&
      accountMembershipsData.account_role !== 'agency_member'
    ) {
      throw new Error('Unauthorized access to order agency members');
    }

    if (orderData.propietary_organization_id === accountData.organization_id) {
      const { data: agencyMembersData, error: agencyMembersError } =
        await client
          .from('accounts')
          .select('id, name, email, picture_url, calendar')
          .eq('organization_id', agencyId ?? accountData.organization_id);

      if (agencyMembersError) throw agencyMembersError;
      return agencyMembersData;
    }

    const { data: agencyMembersData, error: agencyMembersError } = await client
      .from('accounts')
      .select(
        `
        id, 
        name, 
        email,
        user_settings (
          phone_number,
          picture_url,
          calendar
        )
      `,
      )
      .eq('organization_id', agencyId ?? accountData.primary_owner_user_id);

    if (agencyMembersError) throw agencyMembersError;

    return agencyMembersData;
  } catch (error) {
    console.error('Error fetching order agency members:', error);
    throw error;
  }
}

export const getOrders = async () => {
  try {
    const orders = await hasPermissionToReadOrders();
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export async function getAgencyClients(
  agencyId: string,
  orderId: Order.Type['id'],
) {
  try {
    const client = getSupabaseServerComponentClient();

    const { error: userAuthenticatedError, data: userAuthenticatedData } =
      await client.auth.getUser();

    if (userAuthenticatedError) throw userAuthenticatedError;
    const userId = userAuthenticatedData?.user?.id;

    // Retrieve authenticated account information
    const { data: accountData, error: accountError } = await client
      .from('accounts')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (accountError) throw accountError;

    const { data: accountMembershipsData, error: accountMembershipsDataError } =
      await client
        .from('accounts_memberships')
        .select('account_role')
        .eq('user_id', userId)
        .single();

    if (accountMembershipsDataError) throw accountMembershipsDataError;

    const userRoles = new Set([
      'agency_owner',
      'agency_project_manager',
      'client_owner',
    ]);

    if (!userRoles.has(accountMembershipsData.account_role)) {
      throw new Error('Unauthorized access to agency clients');
    }

    const { data: orderData, error: orderError } = await client
      .from('orders_v2')
      .select('agency_id, client_organization_id')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    if (
      orderData.agency_id !== accountData.organization_id &&
      accountMembershipsData.account_role !== 'client_owner'
    ) {
      throw new Error('Unauthorized access to this order');
    }

    const { data: clientsData, error: clientsError } = await client
      .from('clients')
      .select('user_client_id')
      .eq('agency_id', agencyId)
      .eq('organization_client_id', orderData.client_organization_id)
      .neq('user_client_id', userId);

    if (clientsError) throw clientsError;

    const clientDetailsPromises = clientsData.map(async (clientCurrent) => {
      const { data: accountData, error: accountError } = await client
        .from('accounts')
        .select('id, name, email, picture_url')
        .eq('id', clientCurrent.user_client_id)
        .eq('is_personal_account', true)
        .single();

      if (accountError) throw accountError;

      return accountData;
    });

    const clientDetails = await Promise.all(clientDetailsPromises);

    return clientDetails;
  } catch (error) {
    console.error('Error fetching agency clients:', error);
    throw error;
  }
}

export async function getPropietaryOrganizationIdOfOrder(orderId: string) {
  try {
    const client = getSupabaseServerComponentClient();

    const { data: clientOrganizationData, error: clientOrganizationDataError } =
      await client
        .from('orders_v2')
        .select('client_organization_id')
        .eq('id', orderId)
        .single();

    if (clientOrganizationDataError) throw clientOrganizationDataError;

    return clientOrganizationData;
  } catch (error) {
    console.error('Error fetching Agency Owner User Id:', error);
  }
}

export async function getOrdersByUserId(
  userId: string,
  includeBrief?: boolean,
  timeInterval?: number,
) {
  try {
    const client = getSupabaseServerComponentClient();

    // Step 1: Fetch the user's account
    const currentUserAccount = await fetchCurrentUserAccount(client, userId);
    const userRole = await getUserRole();

    const agencyRoles = new Set([
      'agency_owner',
      'agency_project_manager',
      'agency_member',
    ]);

    const clientRoles = new Set(['client_owner', 'client_member']);

    // Step 2: Fetch the orders (iD's) that the user belongs to
    let ordersIdsUserBelongsTo: number[] = [];

    if (agencyRoles.has(userRole)) {
      const ordersAssignedToAgencyMember =
        await fetchAssignedOrdersForAgencyMember(client, userId);

      ordersIdsUserBelongsTo = ordersAssignedToAgencyMember.map(
        (order) => order.order_id,
      );
    } else if (clientRoles.has(userRole)) {
      const ordersAssignedToClient = await fetchAssignedOrdersForClient(
        client,
        userId,
      );
      ordersIdsUserBelongsTo = ordersAssignedToClient.map(
        (order) => order.order_id,
      );
    }

    let orders;

    // Step 3: Prepare the query
    let query = client
      .from('orders_v2')
      .select(
        `*, client_organization:accounts!client_organization_id(id, name),
      customer:accounts!customer_id(id, name),
      assigned_to:order_assignations(agency_member:accounts(id, name, email, picture_url))
      `,
      )
      .order('created_at', { ascending: false })
      .or(
        `client_organization_id.eq.${currentUserAccount.organization_id},agency_id.eq.${currentUserAccount.organization_id}`,
      )
      .in('id', ordersIdsUserBelongsTo);

    let startDate = new Date().toISOString();

    if (timeInterval) {
      const startDateTime = new Date(startDate);
      startDateTime.setDate(startDateTime.getDate() - timeInterval);
      startDate = startDateTime.toISOString();

      query = query.gt('created_at', startDate);
    }

    // Step 4: Fetch the order where the currentUserAccount is the client_organization_id or the agency_id
    const { error: orderError, data: orderData } = await query;

    orders = orderData;

    const orderIds = orderData?.map((order) => order.uuid) ?? [];

    // Step 5: Fetch the briefs for the orders and add them to the orders (if needed)
    if (includeBrief) {
      const briefResponseData = await fetchBriefsResponsesforOrders(
        client,
        orderIds,
      );

      const briefIds =
        briefResponseData?.map((response) => response?.brief_id) ?? [];

      const briefData = await fetchBriefs(client, briefIds, ['name', 'id']);

      // Insert the brief names into the orders
      // Map briefs to orders => each order has a brief_ids => take the first brief
      orders = orders?.map((order) => {
        const brief = briefData?.find(
          (brief) => brief.id === order.brief_ids?.[0],
        );
        return {
          ...order,
          brief: {
            name: brief?.name,
          },
        };
      });
    }

    if (orderError)
      throw new CustomError(
        HttpStatus.Error.BadRequest,
        `Error fetching orders for user, ${orderError.message}`,
        ErrorOrderOperations.ORDER_NOT_FOUND,
      );

    return CustomResponse.success(orders).toJSON();
  } catch (error) {
    console.error('Error fetching order:', error);
    return CustomResponse.error(error).toJSON();
  }
}

export async function fetchAssignedOrdersForAgencyMember(
  client: SupabaseClient<Database>,
  userId: string,
) {
  try {
    const {
      data: ordersAssignedToAgencyMember,
      error: agencyOrderAssignationsError,
    } = await client
      .from('order_assignations')
      .select('order_id, agency_member_id')
      .eq('agency_member_id', userId);

    if (agencyOrderAssignationsError) {
      throw new Error(
        `Error fetching agency order assignations: ${agencyOrderAssignationsError.message}`,
      );
    }

    return ordersAssignedToAgencyMember;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function fetchAssignedOrdersForClient(
  client: SupabaseClient<Database>,
  userId: string,
) {
  try {
    const {
      data: ordersAssignedToClient,
      error: clientOrdersAssignationsError,
    } = await client
      .from('order_followers')
      .select('order_id, client_member_id')
      .eq('client_member_id', userId);

    if (clientOrdersAssignationsError) {
      throw new Error(
        `Error fetching client order assignations: ${clientOrdersAssignationsError.message}`,
      );
    }

    return ordersAssignedToClient;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
