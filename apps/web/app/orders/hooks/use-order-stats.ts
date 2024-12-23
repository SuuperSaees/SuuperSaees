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
  const calculateStats = (orders: Order.Response[]) => {
    const ordersExists = orders && orders.length > 0;

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
      total: ordersExists ? orders?.length : null,
      // Calculate the average rating of the reviews
      averageRating: ordersExists
        ? orders?.reduce((acc, order) => acc + (order.review?.rating ?? 0), 0) /
            orders?.filter((order) => order.review?.rating).length || 0
        : null,
    };
  };

  const currentStats = calculateStats(ordersCurrentPeriod);
  const previousStats = calculateStats(ordersPreviousPeriod);

  return {
    currentStats,
    previousStats,
  };
}
