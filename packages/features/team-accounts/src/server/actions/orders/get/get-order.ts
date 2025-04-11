'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import {
  CustomError,
  CustomResponse,
  ErrorOrderOperations,
} from '@kit/shared/response';
import { Database } from '@kit/supabase/database';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { AgencyStatus } from '../../../../../../../../apps/web/lib/agency-statuses.types';
import { Order } from '../../../../../../../../apps/web/lib/order.types';
import { HttpStatus } from '../../../../../../../shared/src/response/http-status';
import {
  fetchFormfieldsWithResponses,
} from '../../briefs/get/get-brief';
import {
  fetchCurrentUser,
  fetchCurrentUserAccount,
  getUserRole,
} from '../../members/get/get-member-account';
import { hasPermissionToReadOrderDetails } from '../../permissions/orders';
import { getOrdersReviewsForUser, getOrdersReviewsById } from '../../review/get/get-review';
import { Tags } from '../../../../../../../../apps/web/lib/tags.types';
import { Organization } from '../../../../../../../../apps/web/lib/organization.types';

export const getOrderById = async (orderId: Order.Type['id']) => {
  try {
    const client = getSupabaseServerComponentClient();

    const { data: orderData, error: orderError } = await client
      .from('orders_v2')
      .select(
        `*, client:accounts!customer_id(id, name, email, picture_url, created_at, settings:user_settings(name, picture_url)), 
        messages(*, user:accounts(id, name, email, picture_url, settings:user_settings(name, picture_url)), files(*)), 
        activities(*, user:accounts(id, name, email, picture_url, settings:user_settings(name, picture_url))),
          reviews(*, user:accounts(id, name, email, picture_url, settings:user_settings(name, picture_url))), 
          files(*, user:accounts(id, name, email, picture_url, settings:user_settings(name, picture_url))),
         assigned_to:order_assignations(agency_member:accounts(id, name, email, deleted_on, picture_url, settings:user_settings(name, picture_url))),
         followers:order_followers(client_follower:accounts(id, name, email, picture_url, settings:user_settings(name, picture_url))),
         order_tags(tag:tags(id, name, color, organization_id))
        `,
      )
      .eq('id', orderId)
      .single();

      if (orderData?.followers?.length) {
        const adminClient = getSupabaseServerComponentClient({
          admin: true
        });
        const followerIds = orderData.followers
          .map(f => f.client_follower?.id)

        const { data: rolesData } = await adminClient
          .from('accounts_memberships')
          .select('user_id, account_role')
          .in('user_id', followerIds);

        orderData.followers = orderData.followers
          .map(follower => {
            if (!follower.client_follower) return null;
            
            const userRole = rolesData?.find(r => 
              r.user_id === follower.client_follower?.id
            )?.account_role;

            if (userRole === 'client_guest') return null;
            
            return {
              ...follower,
              client_follower: {
                id: follower.client_follower?.id,
                name: follower.client_follower?.name,
                email: follower.client_follower?.email,
                picture_url: follower.client_follower?.picture_url,
                settings: follower.client_follower?.settings,
                role: userRole
              }
            };
          })
          .filter(Boolean); 
      }


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
        .from('organizations')
        .select('name, slug')
        .eq('id', orderData.client_organization_id)
        .single();

    if (clientOrganizationError) throw clientOrganizationError.message;

    // append brief responses to the order
    const briefResponses = await fetchFormfieldsWithResponses(orderData.uuid);

    const proccesedData = {
      ...orderData,
      tags: Array.isArray(orderData.order_tags) 
        ? orderData.order_tags.map(tagItem => tagItem.tag) 
        : orderData.order_tags ? [orderData.order_tags?.tag as Tags.Type] : [],
      messages: orderData.messages.map((message) => {
        return {
          ...message,
          user: message.user,
        };
      }),
      assigned_to: orderData.assigned_to.filter(assignment => 
        !assignment.agency_member?.deleted_on && true
        // assignment.agency_member?.organization_id === orderData.agency_id
      ),
      client_organization: clientOrganizationData,
      brief_responses: briefResponses,
    };

    return proccesedData as unknown as Order.Relational;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export async function getOrderAgencyMembers(
  agencyId: Organization.Type['id'],
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
      .from('accounts_memberships')
      .select('organization_id, account_role')
      .eq('user_id', userId)
      .eq('organization_id', agencyId)
      .single();

    if (accountError) throw accountError;

    // Retrieve the order
    const { data: orderData, error: orderError } = await client
      .from('orders_v2')
      .select()
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    if (
      accountData.account_role &&
      accountData.account_role !== 'agency_project_manager' &&
      accountData.account_role !== 'agency_owner' &&
      accountData.account_role !== 'agency_member'
    ) {
      throw new Error('Unauthorized access to order agency members');
    }

    if (orderData.propietary_organization_id === accountData.organization_id) {
      const { data: agencyMembersData, error: agencyMembersError } =
        await client
          .from('accounts')
          .select(
            'id, name, email, picture_url, user_settings(name, picture_url, calendar), accounts_memberships(organization_id)',
          )
          .eq('accounts_memberships.organization_id', agencyId)
          .is('deleted_on', null);

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
        picture_url,
        user_settings (
          name,
          phone_number,
          picture_url,
          calendar
        ),
        accounts_memberships(organization_id)
      `,
      )
      .eq('accounts_memberships.organization_id', agencyId)
      .is('deleted_on', null);

    if (agencyMembersError) throw agencyMembersError;

    return agencyMembersData;
  } catch (error) {
    console.error('Error fetching order agency members:', error);
    // throw error;
  }
}

export const getOrders = async (
  includeBrief?: boolean,
): Promise<Order.Response[]> => {
  try {
    const client = getSupabaseServerComponentClient();
    const userData = await fetchCurrentUser(client);
    const userAccount = await fetchCurrentUserAccount(client, userData.id);
    const userId = userData.id;

    if (!userAccount.organization_id)
      throw new Error('User account not found (no organization_id)');

    // Step 1: Get and define the user's role
    const role = await getUserRole() ?? '';
    const clientRoles = new Set(['client_owner', 'client_member', 'client_guest']);
    const agencyRoles = new Set([
      'agency_owner',
      'agency_project_manager',
      'agency_member',
    ]);

    const isClient = clientRoles.has(role);
    const isAgency = agencyRoles.has(role);
    const isAgencyMember = isAgency && role === 'agency_member';

    const isAgencyOwnerOrProjectManager =
      (isAgency && role === 'agency_project_manager') ||
      role === 'agency_owner';
    // Step 2: Prerpare the query
    let query = client
      .from('orders_v2')
      .select(
        `*, client_organization:organizations!client_organization_id(id, name, settings:organization_settings!organization_id(key, value)),
        customer:accounts!customer_id(id, name, email, picture_url, settings:user_settings(name, picture_url)),
        assigned_to:order_assignations(agency_member:accounts(id, name, email, deleted_on, picture_url, settings:user_settings(name, picture_url))),
        tags:order_tags(tag:tags(*))
        ${includeBrief ? ', brief:briefs(name)' : ''}
        `,
        { count: 'exact' },
      )
      .is('deleted_on', null)
      .order('created_at', { ascending: false })
   
    let orders: Order.Response[] = [];

    if (isClient) {
      const ordersAssignedToClient = await fetchAssignedOrdersForClient(
        client,
        userId,
      );

      const ordersIdsClientBelongsTo = ordersAssignedToClient.map(
        (order) => order.order_id,
      );
      if(role === 'client_guest'){
        query = query.eq('visibility', 'public');
      }
      
      query = query.in('id', ordersIdsClientBelongsTo);
    } else if (isAgencyMember) {
      const ordersAssignedToAgencyMember =
        await fetchAssignedOrdersForAgencyMember(client, userId);

      const ordersIdsAgencyMemberBelongsTo = ordersAssignedToAgencyMember.map(
        (order) => order.order_id,
      );
      query = query
        .in('id', ordersIdsAgencyMemberBelongsTo)
        .eq('agency_id', userAccount.organization_id);
    } else if (isAgencyOwnerOrProjectManager) {
      query = query.eq('agency_id', userAccount.organization_id);
    } else {
      throw new Error('Invalid user role');
    }

    // Step 3: Fetch orders
    const { data: ordersData, error: ordersError } = await query;

    if (ordersError) {
      console.error(ordersError.message);
      throw new Error(`Error fetching orders, ${ordersError.message}`);
    }

    orders = ordersData.map(order => ({
      ...order,
      assigned_to: order.assigned_to ?? [],
      // assigned_to: order.assigned_to?.filter(assignment => 
      //   !assignment.agency_member?.deleted_on && 
      //   assignment.agency_member?.organization_id === order.agency_id
      // ) ?? [],
    }));

    // Step 3: Collect all status_ids from orders
    const statusIds = Array.from(
      new Set(
        orders
          .map((order: Order.Type) => order.status_id as number)
          .filter(Boolean),
      ),
    );

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
    const statusMap = new Map<number, AgencyStatus.Type>();
    statuses?.forEach((status) => {
      statusMap.set(status.id, status);
    });

    // Step 6: Assign the status to each order and other transformations  
    orders.forEach((order) => {
      const clientOrganizationPictureURL = order.client_organization?.settings?.find(setting => setting.key === 'logo_url')?.value ?? '';
      order.client_organization = { id: order.client_organization?.id, name: order.client_organization?.name, picture_url: clientOrganizationPictureURL };
      if (!order.status_id) return;
      order.statusData = statusMap.get(order.status_id) ?? null;
    });

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
        .select('id, name, email, picture_url, settings:user_settings(name, picture_url)')
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

export async function getPropietaryOrganizationIdOfOrder(orderId: string, adminActived= false) {
  try {
    const client = getSupabaseServerComponentClient({
      admin: adminActived
    });

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
  includeReviews?: boolean,
) {
  try {
    const client = getSupabaseServerComponentClient();

    // Step 1: Fetch the user's account
    const currentUserAccount = await fetchCurrentUserAccount(client, userId);
    const userRole = await getUserRole() ?? '';

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
      assigned_to:order_assignations(agency_member:accounts(id, name, email, deleted_on, picture_url, organization_id, settings:user_settings(name, picture_url))),
      reviews(*, user:accounts(id, name, email, picture_url, settings:user_settings(name, picture_url)))
      ${includeBrief ? ', brief:briefs(name)' : ''}
      `,
      )
      .order('created_at', { ascending: false })
      .or(
        `client_organization_id.eq.${currentUserAccount.organization_id},agency_id.eq.${currentUserAccount.organization_id}`,
      )
      .in('id', ordersIdsUserBelongsTo)
      .is('deleted_on', null);

    let startDate = new Date().toISOString();

    if (timeInterval) {
      const startDateTime = new Date(startDate);
      startDateTime.setDate(startDateTime.getDate() - timeInterval);
      startDate = startDateTime.toISOString();

      query = query.gt('created_at', startDate);
    }

    // Step 4: Fetch the order where the currentUserAccount is the client_organization_id or the agency_id
    const { error: orderError, data: orderData } = await query;

    orders = orderData?.map(order => ({
      ...order,
      assigned_to: order.assigned_to ?? [],
      // assigned_to: order.assigned_to?.filter(assignment => 
      //   !assignment.agency_member?.deleted_on && 
      //   assignment.agency_member?.organization_id === order.agency_id
      // ) ?? [],
    }));

    
    if (includeReviews) {
      const reviews = await getOrdersReviewsForUser(userId);
      orders = orders?.map((order) => {
        const review = reviews.find((review) => review.order_id === order.id);
        return {
          ...order,
          review: review,
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

export async function getOrdersByOrganizationId(
  organizationId: string,
  includeBrief?: boolean,
  timeInterval?: number,
  includeReviews?: boolean,
) {
  try {
    const client = getSupabaseServerComponentClient();

    // Step 1: Prepare the query
    let query = client
      .from('orders_v2')
      .select(
        `*, client_organization:organizations!client_organization_id(id, name),
      customer:accounts!customer_id(id, name),
      assigned_to:order_assignations(agency_member:accounts(id, name, email, picture_url, deleted_on, settings:user_settings(name, picture_url))), 
      reviews(*, user:accounts(id, name, email, picture_url, settings:user_settings(name, picture_url)))
      ${includeBrief ? ', brief:briefs(name)' : ''}
      `,
      )
      .order('created_at', { ascending: false })
      .or(
        `client_organization_id.eq.${organizationId},agency_id.eq.${organizationId}`,
      )
      .is('deleted_on', null);

    let startDate = new Date().toISOString();

    if (timeInterval) {
      const startDateTime = new Date(startDate);
      startDateTime.setDate(startDateTime.getDate() - timeInterval);
      startDate = startDateTime.toISOString();

      query = query.gt('created_at', startDate);
    }

    // Step 2: Fetch the orders
    const { error: orderError, data: orderData } = await query;

    if (orderError) {
      throw new CustomError(
        HttpStatus.Error.BadRequest,
        `Error fetching orders for organization, ${orderError.message}`,
        ErrorOrderOperations.ORDER_NOT_FOUND,
      );
    }

    let orders = orderData.map(order => ({
      ...order,
      assigned_to: order.assigned_to ?? [],
      // assigned_to: order.assigned_to?.filter(assignment => 
      //   !assignment.agency_member?.deleted_on && 
      //   assignment.agency_member?.organization_id === order.agency_id
      // ) ?? [],
    }));

    // Step 4: Fetch the reviews for the orders and add them to the orders (if needed)
    if (includeReviews) {
      const orderIds = orders.map((order) => order.id);
      const reviews = await getOrdersReviewsById(orderIds);
      orders = orders?.map((order) => {
        const review = reviews.find((review) => review.order_id === order.id);
        return { ...order, review };
      });
    }

    return CustomResponse.success(orders).toJSON();
  } catch (error) {
    console.error('Error fetching orders by organization:', error);
    return CustomResponse.error(error).toJSON();
  }
}
