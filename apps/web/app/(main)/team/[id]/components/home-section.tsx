'use client';

import { useCallback } from 'react';

import { useParams } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { SkeletonOrdersSection } from '~/components/organization/skeleton-orders-section';
import { UserWithSettings } from '~/lib/account.types';
import { Order } from '~/lib/order.types';
import { User } from '~/lib/user.types';
import { OrdersProvider } from '~/(main)/orders/components/context/orders-context';
import ProjectsBoard from '~/(main)/orders/components/projects-board';
import { useOrderStats } from '~/(main)/orders/hooks/use-order-stats';
import { getTags } from '~/server/actions/tags/tags.action';
import { getOrdersByUserId } from '~/team-accounts/src/server/actions/orders/get/get-order';

import CardStats from '../../../../components/ui/card-stats';

interface HomeSectionProps {
  agencyMembers: UserWithSettings[];
}

export default function HomeSection({ agencyMembers }: HomeSectionProps) {
  const { t } = useTranslation('statistics');

  const { id } = useParams();
  
  // Convert UserWithSettings to User.Response format
  const convertedAgencyMembers: User.Response[] = agencyMembers.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    picture_url: member.user_settings.picture_url,
  }));

  const queryKey = ['orders', id as string];
  const queryFn = useCallback(async (): Promise<Order.Response[]> => {
    const orders = await getOrdersByUserId(
      (id as string) ?? '',
      true,
      60,
      true,
    );
    return (orders.success?.data ?? []) as Order.Response[];
  }, [id]);

  const memberOrdersQuery = useQuery({
    queryKey,
    queryFn,
  });

  const memberOrders = memberOrdersQuery?.data ?? [];

  const tagsQuery = useQuery({
    queryKey: ['tags'],
    queryFn: async () => await getTags(memberOrders?.[0]?.agency_id ?? ''),
    enabled: !!memberOrders?.length,
  });

  const tags = tagsQuery?.data ?? [];

  const { currentStats, previousStats } = useOrderStats(memberOrders);
  if (tagsQuery.isLoading || memberOrdersQuery.isLoading) {
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
          type="active"
        />
        <CardStats
          title={t('projects.rating.average')}
          value={{
            current: currentStats.averageRating,
            previous: previousStats.averageRating,
            unit: 'months',
          }}
          type="rating"
        />
        <CardStats
          title={t('projects.month.last')}
          value={{
            current: currentStats.total,
            previous: previousStats.total,
            unit: 'months',
          }}
          type="totalInTheLastMonth"
        />
        <CardStats
          title={t('projects.completed')}
          value={{
            current: currentStats.completed,
            previous: previousStats.completed,
            unit: 'months',
          }}
          type="completed"
        />
      </div>
      <OrdersProvider
        agencyMembers={convertedAgencyMembers}
        agencyId={memberOrders[0]?.agency_id ?? ''}
        customQueryKey={queryKey}
        customQueryFn={queryFn}
        initialOrders={memberOrders}
      >
        <ProjectsBoard
          agencyMembers={convertedAgencyMembers}
          tags={tags}
          className="min-h-[800px]"
        />
      </OrdersProvider>
    </div>
  );
}
