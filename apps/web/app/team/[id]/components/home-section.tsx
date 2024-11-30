'use client';

import { isAfter, isBefore, subDays } from 'date-fns';
import { useTranslation } from 'react-i18next';

import EmptyState from '~/components/ui/empty-state';
import { useColumns } from '~/hooks/use-columns';
import { Order } from '~/lib/order.types';

import Table from '../../../components/table/table';
import CardStats from '../../../components/ui/card-stats';

interface HomeSectionProps {
  memberOrders: Order.Response[];
}
export default function HomeSection({ memberOrders }: HomeSectionProps) {
  // console.log('memberOrders', memberOrders);
  const columns = useColumns('orders');
  const { t } = useTranslation('statistics');
  // Current Date
  const now = new Date();

  // Define Time Ranges
  const last30Days = subDays(now, 30);
  const last60Days = subDays(now, 60);

  // Split Orders into Periods
  const ordersCurrentPeriod = memberOrders.filter(
    (order) =>
      isAfter(new Date(order.created_at), last30Days) &&
      isBefore(new Date(order.created_at), now),
  );

  const ordersPreviousPeriod = memberOrders.filter(
    (order) =>
      isAfter(new Date(order.created_at), last60Days) &&
      isBefore(new Date(order.created_at), last30Days),
  );

  // Calculate Stats
  const calculateStats = (orders: Order.Response[]) => {
    const ordersExists = orders && orders.length > 0;

    return {
      active: ordersExists
        ? orders.filter(
            (order) =>
              order.status !== 'completed' && order.status !== 'annulled',
          ).length
        : null,
      completed: ordersExists
        ? orders.filter((order) => order.status === 'completed').length
        : null,
      total: ordersExists ? orders.length : null,
      // Calculate the average rating of the reviews
      averageRating: ordersExists
        ? orders.reduce((acc, order) => acc + (order.review?.rating ?? 0), 0) /
            orders.filter((order) => order.review?.rating).length || 0
        : null,
    };
  };

  const currentStats = calculateStats(ordersCurrentPeriod);
  const previousStats = calculateStats(ordersPreviousPeriod);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2.5">
        <CardStats
          title={t('projects.active')}
          value={{
            current: currentStats.active,
            previous: previousStats.active,
            unit: 'months',
          }}
        />
        <CardStats
          title={t('projects.rating.average')}
          value={{
            current: currentStats.averageRating,
            previous: previousStats.averageRating,
            unit: 'months',
          }} // Placeholder for rating
        />
        <CardStats
          title={t('projects.month.last')}
          value={{
            current: currentStats.total,
            previous: previousStats.total,
            unit: 'months',
          }}
        />
        <CardStats
          title={t('projects.completed')}
          value={{
            current: currentStats.completed,
            previous: previousStats.completed,
            unit: 'months',
          }}
        />
      </div>
      <Table
        data={memberOrders}
        columns={columns}
        filterKey={'title'}
        emptyStateComponent={
          <EmptyState
            title={t('orders:empty.member.title')}
            description={t('orders:empty.member.description')}
            imageSrc="/images/illustrations/Illustration-box.svg"
          />
        }
      />
    </div>
  );
}
