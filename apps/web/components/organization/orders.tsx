'use client';

import { useCallback } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import { User } from '~/lib/user.types';
import { AgencyStatusesProvider } from '~/(main)/orders/components/context/agency-statuses-context';
import { OrdersProvider } from '~/(main)/orders/components/context/orders-context';
import { type CustomQueryFn } from '~/(main)/orders/components/context/orders-context.types';
import ProjectsBoard from '~/(main)/orders/components/projects-board';
import { useOrderStats } from '~/(main)/orders/hooks/use-order-stats';

import CardStats from '../../app/components/ui/card-stats';
import { SkeletonOrdersSection } from './skeleton-orders-section';
import { getOrders } from '~/team-accounts/src/server/actions/orders/get/get-order';

interface OrdersSectionProps {
  organizationId: string;
  showCardStats?: boolean;
}
export default function OrdersSection({
  organizationId,
  showCardStats = true,
}: OrdersSectionProps) {
  const client = useSupabase();
  const { t } = useTranslation('statistics');

  const { workspace, organization, agency } = useUserWorkspace();
  const agencySlug = organization?.slug;

  // Custom query function for this specific organization
  const customQueryFn: CustomQueryFn = useCallback(async ({ page, limit, searchTerm }) => {
    const orders = await getOrders(organizationId, 'client', true, {
      pagination: {
        page,
        limit,
      },
      search: searchTerm ? { term: searchTerm } : undefined,
    });
    return orders;
  }, [organizationId]);

  // Custom query key for this organization
  const customQueryKey = ['organization-orders', organizationId];

  // Initial data query for the first page
  const initialDataQuery = useQuery({
    queryKey: [...customQueryKey, { page: 1, limit: 20, search: '' }],
    queryFn: () => customQueryFn({ page: 1, limit: 20, searchTerm: '' }),
  });

  const organizationOrders = initialDataQuery.data?.data ?? [];
  
  const validAgencyRoles = new Set([
    'agency_owner',
    'agency_project_manager',
    'agency_member',
  ]);

  const agencyStatuses = validAgencyRoles.has(workspace?.role ?? '') ? organization?.statuses : agency?.statuses

  const agencyMembersQuery = useQuery({
    queryKey: ['agencyMembers', agencySlug],
    queryFn: async () =>
      await client.rpc('get_account_members', {
        organization_slug: agencySlug ?? '',
      }),
    enabled: !!agencySlug && validAgencyRoles.has(workspace?.role ?? ''),
  });

  const agencyMembers = agencyMembersQuery?.data?.data ?? [];

  const tags = (validAgencyRoles.has(workspace?.role ?? '') ? organization?.tags : agency?.tags) ?? []

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
  })) as unknown as User.Response[];

  const { currentStats, previousStats } = useOrderStats(organizationOrders);

  if (
    initialDataQuery.isLoading ||
    agencyMembersQuery.isLoading
  ) {
    return <SkeletonOrdersSection />;
  }

  return (
    <div className="flex h-full flex-col gap-8">
      {showCardStats && (
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
      )}
      <OrdersProvider
        agencyMembers={transformedAgencyMembers}
        agencyId={organizationOrders[0]?.agency_id ?? ''}
        customQueryFn={customQueryFn}
        customQueryKey={customQueryKey}
        initialOrders={initialDataQuery.data}
      >
        <AgencyStatusesProvider
          initialStatuses={agencyStatuses as typeof agencyStatuses}
          agencyMembers={transformedAgencyMembers}
        >
          <ProjectsBoard
            agencyMembers={transformedAgencyMembers}
            tags={tags as typeof tags}
            className="min-h-[800px]"
          />
        </AgencyStatusesProvider>
      </OrdersProvider>
    </div>
  );
}
