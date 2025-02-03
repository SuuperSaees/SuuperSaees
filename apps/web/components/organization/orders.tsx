'use client';

import { useCallback } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import { User } from '~/lib/user.types';
import { AgencyStatusesProvider } from '~/orders/components/context/agency-statuses-context';
import { OrdersProvider } from '~/orders/components/context/orders-context';
import ProjectsBoard from '~/orders/components/projects-board';
import { useOrderStats } from '~/orders/hooks/use-order-stats';
import { getTags } from '~/server/actions/tags/tags.action';
import { getOrdersByOrganizationId } from '~/team-accounts/src/server/actions/orders/get/get-order';
import { getAgencyStatuses } from '~/team-accounts/src/server/actions/statuses/get/get-agency-statuses';

import CardStats from '../../app/components/ui/card-stats';
import { SkeletonOrdersSection } from './skeleton-orders-section';

interface OrdersSectionProps {
  organizationId: string;
}
export default function OrdersSection({ organizationId }: OrdersSectionProps) {
  const client = useSupabase();
  const { t } = useTranslation('statistics');

  const { workspace, organization } = useUserWorkspace();
  const agencySlug = organization?.slug;

  const queryKey = ['orders', organizationId];

  const queryFn = useCallback(async () => {
    const orders = await getOrdersByOrganizationId(organizationId);
    return orders.success?.data ?? [];
  }, [organizationId]);

  const organizationOrdersQuery = useQuery({
    queryKey,
    queryFn,
  });

  const organizationOrders = organizationOrdersQuery.data ?? [];

  const validAgencyRoles = new Set([
    'agency_owner',
    'agency_project_manager',
    'agency_member',
  ]);

  const agencyStatusesQuery = useQuery({
    queryKey: ['statuses'],
    queryFn: async () =>
      await getAgencyStatuses(organizationOrders?.[0]?.agency_id ?? ''),
    enabled: !!organizationOrders?.length,
  });

  const agencyStatuses = agencyStatusesQuery?.data ?? [];

  const agencyMembersQuery = useQuery({
    queryKey: ['agencyMembers', agencySlug],
    queryFn: async () =>
      await client.rpc('get_account_members', {
        account_slug: agencySlug ?? '',
      }),
    enabled: !!agencySlug && validAgencyRoles.has(workspace?.role ?? ''),
  });

  const agencyMembers = agencyMembersQuery?.data?.data ?? [];

  const tagsQuery = useQuery({
    queryKey: ['tags'],
    queryFn: async () =>
      await getTags(organizationOrders?.[0]?.agency_id ?? ''),
    enabled: !!organizationOrders?.length,
  });

  const tags = tagsQuery?.data ?? [];

  // Transform agencyMembers to match the expected User.Response type

  const transformedAgencyMembers = agencyMembers?.map((member) => ({
    ...member,
    organization_id: organizationOrders[0]?.agency_id ?? '',
    picture_url: member.picture_url ?? null,
    settings: {
      calendar: null,
      created_at: member.created_at,
      name: member.name,
      phone_number: null,
      picture_url: member.picture_url ?? null,
      user_id: member.user_id,
    },
  })) as User.Response[];

  const { currentStats, previousStats } = useOrderStats(organizationOrders);

  if (
    organizationOrdersQuery.isLoading ||
    agencyStatusesQuery.isLoading ||
    agencyMembersQuery.isLoading ||
    tagsQuery.isLoading
  ) {
    return <SkeletonOrdersSection />;
  }

  return (
    <div className="flex flex-col gap-4 h-full">
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
        agencyMembers={transformedAgencyMembers}
        agencyId={organizationOrders[0]?.agency_id ?? ''}
        queryKey={queryKey}
        queryFn={queryFn}
        initialOrders={organizationOrders}
      >
        <AgencyStatusesProvider
          initialStatuses={agencyStatuses}
          agencyMembers={transformedAgencyMembers}
        >
          <ProjectsBoard agencyMembers={transformedAgencyMembers} tags={tags} className="min-h-[800px]" />
        </AgencyStatusesProvider>
      </OrdersProvider>
    </div>
  );
}
