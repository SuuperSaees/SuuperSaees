'use client';

import { useTranslation } from 'react-i18next';

import EmptyState from '~/components/ui/empty-state';
import { useColumns } from '~/hooks/use-columns';
import { UserWithSettings } from '~/lib/account.types';
import { Order } from '~/lib/order.types';
import { useUserOrderActions } from '~/orders/hooks/user-order-actions';

import Table from '../../../components/table/table';
import CardStats from '../../../components/ui/card-stats';
import { useOrderStats } from '~/orders/hooks/use-order-stats';

interface HomeSectionProps {
  memberOrders: Order.Response[];
  agencyMembers: UserWithSettings[];
}
export default function HomeSection({
  memberOrders,
  agencyMembers,
}: HomeSectionProps) {
  // console.log('memberOrders', memberOrders);
  const { orderDateMutation, orderAssignsMutation } = useUserOrderActions();
  const actions = {
    orderDateMutation: orderDateMutation,
    updateOrderAssigns: orderAssignsMutation,
  };
  const additionalData = {
    orderAgencyMembers: agencyMembers,
  };
  const columns = useColumns('orders', {
    data: additionalData,
    actions: actions,
  });
  const { t } = useTranslation('statistics');
  // Current Date
  const { currentStats, previousStats } = useOrderStats(memberOrders);

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
