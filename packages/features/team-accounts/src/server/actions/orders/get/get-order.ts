'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import {
  CustomError,
  CustomResponse,
  ErrorOrderOperations,
} from '@kit/shared/response';
import { Database } from '@kit/supabase/database';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { getSession } from '../../../../../../../../apps/web/app/server/actions/accounts/accounts.action';
import { Order } from '../../../../../../../../apps/web/lib/order.types';
import { Organization } from '../../../../../../../../apps/web/lib/organization.types';
import { Tags } from '../../../../../../../../apps/web/lib/tags.types';
import { HttpStatus } from '../../../../../../../shared/src/response/http-status';
import { fetchFormfieldsWithResponses } from '../../briefs/get/get-brief';
import {
  fetchCurrentUserAccount,
  getUserRole,
} from '../../members/get/get-member-account';
import { hasPermissionToReadOrderDetails } from '../../permissions/orders';
import {
  getOrdersReviewsById,
  getOrdersReviewsForUser,
} from '../../review/get/get-review';
import { User } from '../../../../../../../../apps/web/lib/user.types';

interface Config {
  pagination?: {
    // Cursor-based pagination (for infinite scrolling)
    cursor?: string | number;
    endCursor?: string | number;

    // Offset-based pagination (for page navigation)
    page?: number; // Current page number (1-indexed)
    offset?: number; // Direct offset override

    // Common
    limit?: number;
  };
  search?: {
    term?: string;
    fields?: string[]; // Optional: specify which fields to search in
  };
  filters?: {
    status?: string[];
    tags?: string[];
    priority?: string[];
    assigned_to?: string[];
    client_organization?: string[];
    customer?: string[];
  };
}

export const getOrderById = async (orderId: Order.Type['id']) => {
  try {
    const client = getSupabaseServerComponentClient();

    const { data: orderData, error: orderError } = await client
      .from('orders_v2')
      .select(
        `*, client:accounts!customer_id(id, name, email, picture_url, created_at, settings:user_settings(name, picture_url)), 
         assigned_to:order_assignations(agency_member:accounts(id, name, email, deleted_on, picture_url, settings:user_settings(name, picture_url))),
         followers:order_followers(client_follower:accounts(id, name, email, picture_url, settings:user_settings(name, picture_url))),
         order_tags(tag:tags(id, name, color, organization_id)),
         reviews(order_id)
        `,
      )
      .eq('id', orderId)
      .single();

    if (orderData?.followers?.length) {
      const adminClient = getSupabaseServerComponentClient({
        admin: true,
      });
      const followerIds = orderData.followers.map((f) => f.client_follower?.id);

      const { data: rolesData } = await adminClient
        .from('accounts_memberships')
        .select('user_id, account_role')
        .in('user_id', followerIds);

      orderData.followers = orderData.followers
        .map((follower) => {
          if (!follower.client_follower) return null;

          const userRole = rolesData?.find(
            (r) => r.user_id === follower.client_follower?.id,
          )?.account_role;

          if (userRole === 'client_guest') return null;

          return {
            ...follower,
            client_follower: {
              id: follower.client_follower?.id,
              name:
                follower.client_follower?.settings?.[0]?.name ??
                follower.client_follower?.name,
              email: follower.client_follower?.email,
              picture_url:
                follower.client_follower?.settings?.[0]?.picture_url ??
                follower.client_follower?.picture_url,
              role: userRole,
            },
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
      client: {
        ...orderData.client,
        name: orderData.client?.settings?.[0]?.name ?? orderData.client?.name,
        picture_url:
          orderData.client?.settings?.[0]?.picture_url ??
          orderData.client?.picture_url,
      },
      tags: Array.isArray(orderData.order_tags)
        ? orderData.order_tags.map((tagItem) => tagItem.tag)
        : orderData.order_tags
          ? [orderData.order_tags?.tag as Tags.Type]
          : [],
      assigned_to: orderData.assigned_to
        .filter(
          (assignment) => !assignment.agency_member?.deleted_on && true,
          // assignment.agency_member?.organization_id === orderData.agency_id
        )
        .map((assignment) => ({
          ...assignment,
          agency_member: {
            ...assignment.agency_member,
            name:
              assignment.agency_member?.settings?.[0]?.name ??
              assignment.agency_member?.name,
            picture_url:
              assignment.agency_member?.settings?.[0]?.picture_url ??
              assignment.agency_member?.picture_url,
          },
        })),
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
      const { data: agencyMemberIds, error: agencyMemberIdsError } =
        await client
          .from('accounts_memberships')
          .select('user_id')
          .eq('organization_id', agencyId);

      if (agencyMemberIdsError) throw agencyMemberIdsError;

      const { data: agencyMembersData, error: agencyMembersError } =
        await client
          .from('accounts')
          .select(
            'id, name, email, picture_url, user_settings(name, picture_url, calendar)',
          )
          .in(
            'id',
            agencyMemberIds.map((member) => member.user_id),
          )
          .is('deleted_on', null);

      if (agencyMembersError) throw agencyMembersError;
      return agencyMembersData.map((member) => ({
        ...member,
        organization_id: accountData.organization_id,
      }));
    }

    const { data: agencyMemberIds, error: agencyMemberIdsError } = await client
      .from('accounts_memberships')
      .select('user_id')
      .eq('organization_id', agencyId);

    if (agencyMemberIdsError) throw agencyMemberIdsError;

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
        )
      `,
      )
      .in(
        'id',
        agencyMemberIds.map((member) => member.user_id),
      )
      .is('deleted_on', null);

    if (agencyMembersError) throw agencyMembersError;

    return (
      agencyMembersData?.map((member) => ({
        ...member,
        organization_id: accountData.organization_id,
      })) ?? []
    );
  } catch (error) {
    console.error('Error fetching order agency members:', error);
    throw error;
  }
}

/**
 * Retrieves orders with flexible pagination support
 * @param includeBrief - Whether to include brief information in the response
 * @param config - Configuration object containing pagination options
 * @param config.pagination.page - Page number for offset-based pagination (1-indexed)
 * @param config.pagination.offset - Direct offset override for offset-based pagination
 * @param config.pagination.cursor - created_at timestamp for cursor-based pagination (infinite scroll)
 * @param config.pagination.endCursor - created_at timestamp to start from (cursor-based)
 * @param config.pagination.limit - Maximum number of orders to return (default: 10)
 * @returns Object containing data array, pagination metadata, and cursors
 *
 * @example
 * // Offset-based pagination (for page navigation)
 * const page2 = await getOrders(false, { pagination: { page: 2, limit: 20 } });
 *
 * // Cursor-based pagination (for infinite scroll)
 * const nextBatch = await getOrders(false, {
 *   pagination: {
 *     cursor: lastOrderTimestamp,
 *     limit: 20
 *   }
 * });
 */
export const getOrders = async (
  organizationId: string,
  target: 'agency' | 'client',
  includeBrief?: boolean,
  config?: Config,
): Promise<{
  data: Order.Response[];
  nextCursor: string | null;
  count: number | null;
  pagination: {
    limit: number;
    hasNextPage: boolean;
    totalPages: number | null;
    currentPage: number | null;
    isOffsetBased: boolean;
  };
}> => {
  try {
    const client = getSupabaseServerComponentClient();

    const limit = config?.pagination?.limit;
    const shouldPaginate = limit !== undefined;
    const effectiveLimit = limit ?? 10; // Default limit for calculations
    
    // Calculate pagination variables early
    const currentPage = config?.pagination?.page ?? 1;
    const isOffsetBased = shouldPaginate && (
      config?.pagination?.page !== undefined ||
      config?.pagination?.offset !== undefined
    );
    
    let query = client
      .from('orders_v2')
      .select(
        `id, title, priority, due_date, created_at, updated_at, status_id, agency_id, 
        client_organization_id, deleted_on, position, propietary_organization_id,
        status:agency_statuses!status_id(*), 
        assignations:order_assignations(member:accounts(id, name, email, deleted_on, picture_url, settings:user_settings(name, picture_url))),
        client_organization:organizations!client_organization_id(id, name, settings:organization_settings!organization_id(key, value)),
        customer:accounts!customer_id(id, name, email, picture_url, settings:user_settings(name, picture_url))
        ${includeBrief ? ', brief:briefs(name)' : ''}
        `,
        { count: 'exact' },
      )
      .is('deleted_on', null)
      .eq(
        target === 'agency' ? 'agency_id' : 'client_organization_id',
        organizationId,
      )
      .order('created_at', { ascending: false });

    // Apply search if provided
    if (config?.search?.term && config.search.term.trim()) {
      const searchTerm = config.search.term.trim();
      
      // Use individual filters for better compatibility
      // Check if it's a numeric search (for ID)
      const isNumericSearch = /^\d+$/.test(searchTerm.replace('#', ''));
      
      if (isNumericSearch) {
        // If it's numeric, search by ID
        query = query.eq('id', parseInt(searchTerm.replace('#', '')));
      } else {
        // For text search, use textSearch or ilike on title and description
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
    }

    // Apply filters if provided
    if (config?.filters) {
      const filters = config.filters;

      // Status filter
      if (filters.status && filters.status.length > 0) {
        // Filter by status_id directly since it's more efficient
        query = query.in('status_id', filters.status);
      }

      // Priority filter
      if (filters.priority && filters.priority.length > 0) {
        query = query.in('priority', filters.priority);
      }

      // Customer filter
      if (filters.customer && filters.customer.length > 0) {
        query = query.in('customer_id', filters.customer);
      }

      // Client organization filter
      if (filters.client_organization && filters.client_organization.length > 0) {
        query = query.in('client_organization_id', filters.client_organization);
      }

      // For assigned_to and tags filters, we need to handle them differently
      // We'll need to fetch the filtered order IDs first and then filter the main query

      let filteredOrderIds: number[] | null = null;

      // Assigned to filter
      if (filters.assigned_to && filters.assigned_to.length > 0) {
        const { data: assignedOrders } = await client
          .from('order_assignations')
          .select('order_id')
          .in('agency_member_id', filters.assigned_to);
        
        const assignedOrderIds = assignedOrders?.map((a: any) => a.order_id) ?? [];
        filteredOrderIds = filteredOrderIds 
          ? filteredOrderIds.filter((id: number) => assignedOrderIds.includes(id))
          : assignedOrderIds;
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const { data: taggedOrders } = await client
          .from('order_tags')
          .select('order_id')
          .in('tag_id', filters.tags);
        
        const taggedOrderIds = taggedOrders?.map((t: any) => t.order_id) ?? [];
        filteredOrderIds = filteredOrderIds 
          ? filteredOrderIds.filter((id: number) => taggedOrderIds.includes(id))
          : taggedOrderIds;
      }

      // Apply the filtered order IDs if any
      if (filteredOrderIds !== null) {
        if (filteredOrderIds.length === 0) {
          // No orders match the filters, return empty result
          return {
            data: [],
            nextCursor: null,
            count: 0,
            pagination: {
              limit: effectiveLimit,
              hasNextPage: false,
              totalPages: 0,
              currentPage: isOffsetBased ? currentPage : null,
              isOffsetBased,
            },
          };
        }
        query = query.in('id', filteredOrderIds);
      }
    }

    // Only apply limit if pagination is requested
    if (shouldPaginate) {
      query = query.limit(effectiveLimit + 1);
    }

    // Apply pagination only if shouldPaginate is true
    if (shouldPaginate) {
      // Apply pagination (offset-based takes priority over cursor-based)
      const isOffsetBased =
        config?.pagination?.page !== undefined ||
        config?.pagination?.offset !== undefined;

      if (isOffsetBased) {
        // Offset-based pagination for page navigation
        const offset =
          config?.pagination?.offset ??
          ((config?.pagination?.page ?? 1) - 1) * effectiveLimit;
        query = query.range(offset, offset + effectiveLimit - 1);
      } else if (config?.pagination?.cursor ?? config?.pagination?.endCursor) {
        // Cursor-based pagination for infinite scrolling
        if (config?.pagination?.cursor) {
          query = query.lt('created_at', config.pagination.cursor);
        }

        if (config?.pagination?.endCursor) {
          query = query.gte('created_at', config.pagination.endCursor);
        }

        query = query.limit(effectiveLimit + 1);
      } else {
        // Default behavior - just limit
        query = query.limit(effectiveLimit + 1);
      }
    }

    // Step 3: Fetch orders
    const { data: orders, error: ordersError, count } = await query;

    if (ordersError) {
      console.error(ordersError.message);
      throw new Error(`Error fetching orders, ${ordersError.message}`);
    }

    let hasNextPage: boolean;
    let nextCursor: string | null = null;
    let paginatedOrders: Order.Response[];

    if (!shouldPaginate) {
      // No pagination: return all orders
      paginatedOrders = transformOrders(orders);
      hasNextPage = false;
    } else if (isOffsetBased) {
      // Offset-based: return exact page data
      paginatedOrders = transformOrders(orders);
      hasNextPage = count ? currentPage * effectiveLimit < count : false;
    } else {
      // Cursor-based: handle extra item for hasNextPage detection
      hasNextPage = orders.length > effectiveLimit;
      paginatedOrders = orders.slice(0, effectiveLimit);
      nextCursor = hasNextPage
        ? (paginatedOrders[paginatedOrders.length - 1]?.created_at ?? null)
        : null;
    }

    return {
      data: paginatedOrders,
      nextCursor,
      count,
      pagination: {
        limit: effectiveLimit,
        hasNextPage,
        totalPages: count ? Math.ceil(count / effectiveLimit) : null,
        currentPage: isOffsetBased ? currentPage : null,
        isOffsetBased,
      },
    };
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

    const { data: userData, error: userError } = await client.auth.getUser();

    if (userError) throw userError;

    const userId = userData?.user?.id ?? '';

    const organizationData = (await getSession())?.organization;
    const role = organizationData?.role ?? '';
    const organizationId = organizationData?.id ?? '';

    const userRoles = new Set([
      'agency_owner',
      'agency_project_manager',
      'client_owner',
    ]);

    if (!userRoles.has(role)) {
      throw new Error('Unauthorized access to agency clients');
    }

    const { data: orderData, error: orderError } = await client
      .from('orders_v2')
      .select('agency_id, client_organization_id')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    if (orderData.agency_id !== organizationId && role !== 'client_owner') {
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
        .select(
          'id, name, email, picture_url, settings:user_settings(name, picture_url)',
        )
        .eq('id', clientCurrent.user_client_id)
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

export async function getPropietaryOrganizationIdOfOrder(
  orderId: string,
  adminActived = false,
) {
  try {
    const client = getSupabaseServerComponentClient({
      admin: adminActived,
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
    const userRole = (await getUserRole()) ?? '';

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
        `id, title, priority, due_date, created_at, updated_at, status_id, agency_id, 
        client_organization_id, deleted_on, position, propietary_organization_id,
        status:agency_statuses!status_id(*), 
        assignations:order_assignations(member:accounts(id, name, email, deleted_on, picture_url, settings:user_settings(name, picture_url))),
        client_organization:organizations!client_organization_id(id, name, settings:organization_settings!organization_id(key, value)),
        customer:accounts!customer_id(id, name, email, picture_url, settings:user_settings(name, picture_url)),
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

    orders = transformOrders(orderData);

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
      customer:accounts!customer_id(id, name, email, picture_url, settings:user_settings(name, picture_url)),
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

    let orders = orderData.map((order) => ({
      ...order,
      customer: {
        ...order.customer,
        name: order.customer?.settings?.[0]?.name ?? order.customer?.name ?? '',
        picture_url:
          order.customer?.settings?.[0]?.picture_url ??
          order.customer?.picture_url ??
          '',
        settings: order.customer?.settings?.[0],
      },
      // assigned_to: order.assigned_to?.filter(assignment =>
      //   !assignment.agency_member?.deleted_on &&
      //   assignment.agency_member?.organization_id === order.agency_id
      // ) ?? [],
      assigned_to:
        order.assigned_to?.filter(
          (assignment) => !assignment.agency_member?.deleted_on,
        ) ?? [],
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

// Add this optimized version as an alternative function
export const getOrdersOptimized = async (
  organizationId: string,
  target: 'agency' | 'client',
  includeBrief?: boolean,
  config?: Config,
): Promise<{
  data: Order.Response[];
  nextCursor: string | null;
  count: number | null;
  pagination: {
    limit: number;
    hasNextPage: boolean;
    totalPages: number | null;
    currentPage: number | null;
    isOffsetBased: boolean;
  };
}> => {
  try {
    const client = getSupabaseServerComponentClient();
    const limit = config?.pagination?.limit ?? 10;

    // Build base query with minimal joins first
    let baseQuery = client
      .from('orders_v2')
      .select(
        `id, title, priority, due_date, created_at, updated_at, 
        description, visibility, position,
        status_id, client_organization_id, customer_id, brief_id,
        agency_id, deleted_on, propietary_organization_id, stripe_account_id, uuid, brief_ids `,
        { count: 'exact' },
      )
      .eq(
        target === 'agency' ? 'agency_id' : 'client_organization_id',
        organizationId,
      )
      .is('deleted_on', null)
      .order('created_at', { ascending: false });

    // Apply pagination
    const isOffsetBased =
      config?.pagination?.page !== undefined ||
      config?.pagination?.offset !== undefined;
    const currentPage = config?.pagination?.page ?? 1;

    if (isOffsetBased) {
      const offset = config?.pagination?.offset ?? (currentPage - 1) * limit;
      baseQuery = baseQuery.range(offset, offset + limit - 1);
    } else if (config?.pagination?.cursor ?? config?.pagination?.endCursor) {
      if (config?.pagination?.cursor) {
        baseQuery = baseQuery.lt('created_at', config.pagination.cursor);
      }
      if (config?.pagination?.endCursor) {
        baseQuery = baseQuery.gte('created_at', config.pagination.endCursor);
      }
      baseQuery = baseQuery.limit(limit + 1);
    } else {
      baseQuery = baseQuery.limit(limit + 1);
    }

    // Execute base query
    const { data: orders, error: ordersError, count } = await baseQuery;

    if (ordersError) {
      throw new Error(`Error fetching orders: ${ordersError.message}`);
    }

    if (!orders?.length) {
      return {
        data: [],
        nextCursor: null,
        count: count ?? 0,
        pagination: {
          limit,
          hasNextPage: false,
          totalPages: count ? Math.ceil(count / limit) : 0,
          currentPage: isOffsetBased ? currentPage : null,
          isOffsetBased,
        },
      };
    }

    // Get related data in parallel
    const orderIds = orders.map((order) => order.id);
    const customerIds = [...new Set(orders.map((order) => order.customer_id))];
    const statusIds = [
      ...new Set(orders.map((order) => order.status_id).filter(Boolean)),
    ];
    const orgIds = [
      ...new Set(orders.map((order) => order.client_organization_id)),
    ];

    const [
      assignationsData,
      customersData,
      statusesData,
      organizationsData,
      briefsData,
    ] = await Promise.all([
      // Fetch assignations
      client
        .from('order_assignations')
        .select(
          'order_id, agency_member_id, accounts!agency_member_id(id, name, email, deleted_on, picture_url, settings:user_settings(name, picture_url))',
        )
        .in('order_id', orderIds),

      // Fetch customers
      client
        .from('accounts')
        .select(
          'id, name, email, picture_url, settings:user_settings(name, picture_url)',
        )
        .in('id', customerIds),

      // Fetch statuses
      client
        .from('agency_statuses')
        .select('id, status_name, status_color')
        .in('id', statusIds),

      // Fetch organizations
      client
        .from('organizations')
        .select(
          'id, name, slug, picture_url, settings:organization_settings!organization_id(key, value)',
        )
        .in('id', orgIds),

      // Fetch briefs if needed
      includeBrief
        ? client
            .from('briefs')
            .select('id, name')
            .in('id', orders.map((o) => o.brief_id).filter(Boolean))
        : Promise.resolve({ data: [] }),
    ]);

    // Create lookup maps for faster assembly
    const assignationsMap = new Map<number, Order.Response['assignations']>();
    assignationsData.data?.forEach((assignment) => {
      if (!assignationsMap.has(assignment.order_id)) {
        assignationsMap.set(assignment.order_id, []);
      }
      if (assignment.accounts) {
        const accounts = Array.isArray(assignment.accounts)
          ? assignment.accounts
          : [assignment.accounts];
        accounts.forEach((account) => {
          assignationsMap.get(assignment.order_id)?.push({
            id: account.id,
            name: account.settings?.[0]?.name ?? account.name,
            email: account.email,
            picture_url:
              account.settings?.[0]?.picture_url ?? account.picture_url,
          });
        });
      }
    });

    const customersMap = new Map(
      customersData.data?.map((customer) => [
        customer.id,
        {
          id: customer.id,
          name: customer.settings?.[0]?.name ?? customer.name,
          email: customer.email,
          picture_url:
            customer.settings?.[0]?.picture_url ?? customer.picture_url,
        },
      ]) ?? [],
    );
    const statusesMap = new Map(
      statusesData.data?.map((status) => [status.id, status]) ?? [],
    );
    const organizationsMap = new Map(
      organizationsData.data?.map((org) => [
        org.id,
        {
          id: org.id,
          name: org.name,
          slug: org.slug,
          picture_url:
            org.settings?.find((setting) => setting.key === 'logo_url')
              ?.value ?? org.picture_url,
        },
      ]) ?? [],
    );
    const briefsMap = new Map(
      briefsData.data?.map((brief) => [brief.id, brief]) ?? [],
    );

    // Assemble final data
    let paginatedOrders: Order.Response[];
    let hasNextPage: boolean;
    let nextCursor: string | null = null;

    if (isOffsetBased) {
      paginatedOrders = orders.map((order) =>
        assembleOrder(
          order,
          assignationsMap,
          customersMap,
          statusesMap,
          organizationsMap,
          briefsMap,
        ),
      );
      hasNextPage = count ? currentPage * limit < count : false;
    } else {
      hasNextPage = orders.length > limit;
      const ordersToReturn = orders.slice(0, limit);
      paginatedOrders = ordersToReturn.map((order) =>
        assembleOrder(
          order,
          assignationsMap,
          customersMap,
          statusesMap,
          organizationsMap,
          briefsMap,
        ),
      );
      nextCursor = hasNextPage
        ? (paginatedOrders[paginatedOrders.length - 1]?.created_at ?? null)
        : null;
    }

    return {
      data: paginatedOrders,
      nextCursor,
      count,
      pagination: {
        limit,
        hasNextPage,
        totalPages: count ? Math.ceil(count / limit) : null,
        currentPage: isOffsetBased ? currentPage : null,
        isOffsetBased,
      },
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Helper function to assemble order data
function assembleOrder(
  order: Omit<
    Order.Response,
    'assignations' | 'customer' | 'status' | 'client_organization' | 'brief'
  >,
  assignationsMap: Map<number, Order.Response['assignations']>,
  customersMap: Map<string, Order.Response['customer']>,
  statusesMap: Map<number, Order.Response['status']>,
  organizationsMap: Map<string, Order.Response['client_organization']>,
  briefsMap: Map<string, Order.Response['brief']>,
): Order.Response {
  const customer = customersMap.get(order.customer_id);
  const status = statusesMap.get(order.status_id ?? 0);
  const organization = organizationsMap.get(order.client_organization_id);
  const assignments = assignationsMap.get(order.id ?? 0) ?? [];
  const brief = order.brief_id ? briefsMap.get(order.brief_id) : null;

  return {
    ...order,
    customer: customer
      ? {
          ...customer,
          name: customer?.settings?.[0]?.name ?? customer?.name ?? '',
          picture_url:
            customer?.settings?.[0]?.picture_url ?? customer?.picture_url ?? '',
        }
      : null,
    status: status ?? null,
    client_organization: organization,
    assignations: assignments.map((assignment) => ({
      ...assignment,
      id: assignment?.id ?? '',
      name: assignment?.settings?.[0]?.name ?? assignment?.name ?? '',
      picture_url:
        assignment?.settings?.[0]?.picture_url ?? assignment?.picture_url ?? '',
      email: assignment?.email ?? null,
    })),
    brief,
  };
}

type Order = Omit<Order.Response, 'assignations'> & {
  assignations: {
    member: User.Response
  }[]
}
const transformOrders = (orders: Order[]) => {
  return orders.map((order) => ({
    ...order,
    customer: order.customer
      ? {
          ...order.customer,
          name:
            order.customer?.settings?.[0]?.name ?? order.customer?.name ?? '',
          picture_url:
            order.customer?.settings?.[0]?.picture_url ??
            order.customer?.picture_url ??
            '',
        }
      : null,
    client_organization: order.client_organization
      ? {
          ...order.client_organization,
          picture_url:
            order.client_organization?.settings?.find(
              (setting) => setting.key === 'logo_url',
            )?.value ??
            order.client_organization?.picture_url ??
            '',
        }
      : null,
    assignations: order.assignations?.map(assignment => {
      return {
        id: assignment?.member?.id ?? '',
        name: assignment?.member?.settings?.[0]?.name ?? assignment?.member?.name ?? '',
        picture_url:
          assignment?.member?.settings?.[0]?.picture_url ?? assignment?.member?.picture_url ?? '',
      }
    }),
  }));
};