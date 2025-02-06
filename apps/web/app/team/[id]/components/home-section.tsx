'use client';

import { useCallback } from 'react';

import { useParams } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { SkeletonOrdersSection } from '~/components/organization/skeleton-orders-section';
import { UserWithSettings } from '~/lib/account.types';
import { Order } from '~/lib/order.types';
import { OrdersProvider } from '~/orders/components/context/orders-context';
import ProjectsBoard from '~/orders/components/projects-board';
import { useOrderStats } from '~/orders/hooks/use-order-stats';
import { getTags } from '~/server/actions/tags/tags.action';
import { getOrders } from '~/team-accounts/src/server/actions/orders/get/get-order';

import CardStats from '../../../components/ui/card-stats';

interface HomeSectionProps {
  memberOrders: Order.Response[];
  agencyMembers: UserWithSettings[];
}

export default function HomeSection({
  memberOrders,
  agencyMembers,
}: HomeSectionProps) {
  const { t } = useTranslation('statistics');
  const { currentStats, previousStats } = useOrderStats(memberOrders);
  const { id } = useParams();
  // Transform agencyMembers to match the expected User.Response type

  const tagsQuery = useQuery({
    queryKey: ['tags'],
    queryFn: async () => await getTags(memberOrders?.[0]?.agency_id ?? ''),
    enabled: !!memberOrders?.length,
  });

  const tags = tagsQuery?.data ?? [];

  const queryKey = ['orders', id as string];
  const queryFn = useCallback(async () => {
    return await getOrders(true);
  }, []);

  if (tagsQuery.isLoading) {
    return <SkeletonOrdersSection />;
  }

  return (
    <div className="flex h-full flex-col gap-8">
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
          }}
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
      <OrdersProvider
        agencyMembers={agencyMembers}
        agencyId={memberOrders[0]?.agency_id ?? ''}
        queryKey={queryKey}
        queryFn={queryFn}
        initialOrders={memberOrders}
      >
        <ProjectsBoard
          agencyMembers={agencyMembers}
          tags={tags}
          className="min-h-[800px]"
        />
      </OrdersProvider>
    </div>
  );
}
