import { isBefore, isAfter, subDays } from 'date-fns';

import { Order } from '~/lib/order.types';

export function useOrderStats(orders: Order.Response[]) {
  const now = new Date();

  // Define Time Ranges
  const last30Days = subDays(now, 30);
  const last60Days = subDays(now, 60);

  // Split Orders into Periods
  const ordersCurrentPeriod = orders?.filter(
    (order) =>
      isAfter(new Date(order.created_at), last30Days) &&
      isBefore(new Date(order.created_at), now),
  );

  const ordersPreviousPeriod = orders?.filter(
    (order) =>
      isAfter(new Date(order.created_at), last60Days) &&
      isBefore(new Date(order.created_at), last30Days),
  );

  // Calculate Stats
  const calculateStats = (orders: Order.Response[], filteredOrders: Order.Response[]) => {
    const ordersExists = orders && orders.length > 0;
    const filteredOrdersExists = filteredOrders && filteredOrders.length > 0;

    return {
      active: ordersExists
        ? orders?.filter(
            (order) =>
              order.status !== 'completed' && order.status !== 'annulled',
          ).length
        : null,
      completed: ordersExists
        ? orders?.filter((order) => order.status === 'completed').length
        : null,
      total: filteredOrdersExists ? filteredOrders?.length : null,
      // Calculate the average rating of the reviews using filtered orders
      averageRating: ordersExists
        ? orders?.reduce((acc, order) => {
            const orderRatings = order.reviews?.reduce((reviewAcc, review) => 
              reviewAcc + (review.rating ?? 0), 0) ?? 0;
            return acc + orderRatings;
          }, 0) / orders?.filter(order => 
            order.reviews?.some(review => review.rating != null)
          ).length || null
        : null,
    };
  };

  const currentStats = calculateStats(orders, ordersCurrentPeriod);
  const previousStats = calculateStats(orders, ordersPreviousPeriod);

  return {
    currentStats,
    previousStats,
  };
}
