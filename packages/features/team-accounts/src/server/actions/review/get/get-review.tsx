'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Review } from '../../../../../../../../apps/web/lib/review.types';
import { getUserRole } from '../../members/get/get-member-account';
import {
  fetchAssignedOrdersForAgencyMember,
  fetchAssignedOrdersForClient,
} from '../../orders/get/get-order';

export const getOrdersReviewsForUser = async (
  userId: string,
): Promise<Review.Response[]> => {
  try {
    const client = getSupabaseServerComponentClient();
    // Step 1: Fetch the user's role
    const userRole = await getUserRole() ?? '';

    const agencyRoles = new Set([
      'agency_owner',
      'agency_project_manager',
      'agency_member',
    ]);
    const clientRoles = new Set(['client_owner', 'client_member']);

    // Step 2: Fetch the id's of the orders that the user is assigned to
    let ordersIds: number[] = [];

    if (agencyRoles.has(userRole)) {
      const ordersAssignedToAgencyMember =
        await fetchAssignedOrdersForAgencyMember(client, userId);
      ordersIds = ordersAssignedToAgencyMember.map((order) => order.order_id);

    } else if (clientRoles.has(userRole)) {
      const ordersAssignedToClient = await fetchAssignedOrdersForClient(
        client,
        userId,
      );
      ordersIds = ordersAssignedToClient.map((order) => order.order_id);
    }

    // Step 3: Fetch the reviews associated with the orders and the user
    const { data: reviewsData, error: reviewsError } = await client
      .from('reviews')
      .select('*, order:orders_v2(id, title), user:accounts(id, name, email, picture_url, settings:user_settings(name, picture_url))')
      .in('order_id', ordersIds);

    if (reviewsError) throw reviewsError.message;

    return reviewsData as Review.Response[];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getOrdersReviewsById = async (
  orderIds: number[],
): Promise<Review.Response[]> => {
  try {
    const client = getSupabaseServerComponentClient();

    // Fetch the reviews associated with the given order IDs
    const { data: reviewsData, error: reviewsError } = await client
      .from('reviews')
      .select('*, order:orders_v2(id, title), user:accounts(id, name, email, picture_url, settings:user_settings(name, picture_url))')
      .in('order_id', orderIds);

    if (reviewsError) throw reviewsError.message;

    return reviewsData as Review.Response[];
  } catch (error) {
    console.error('Error fetching reviews by order IDs:', error);
    throw error;
  }
};
