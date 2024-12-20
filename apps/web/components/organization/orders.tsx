'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import { useColumns } from '~/hooks/use-columns';
import { Order } from '~/lib/order.types';
import { AgencyStatusesProvider } from '~/orders/components/context/agency-statuses-context';
import { useUserOrderActions } from '~/orders/hooks/user-order-actions';
import { getOrdersByOrganizationId } from '~/team-accounts/src/server/actions/orders/get/get-order';
import { getAgencyStatuses } from '~/team-accounts/src/server/actions/statuses/get/get-agency-statuses';

import Table from '../../app/components/table/table';
import CardStats from '../../app/components/ui/card-stats';
import EmptyState from '../ui/empty-state';
import { useOrderStats } from '~/orders/hooks/use-order-stats';

interface OrdersSectionProps {
  organizationId: string;
}
export default function OrdersSection({ organizationId }: OrdersSectionProps) {
  const client = useSupabase();
  const { t } = useTranslation('statistics');

  const { workspace, organization } = useUserWorkspace();
  const agencySlug = organization?.slug;

  const organizationOrdersQuery = useQuery({
    queryKey: ['orders', organizationId],
    queryFn: async () => await getOrdersByOrganizationId(organizationId),
  });

  const organizationOrders =
    (organizationOrdersQuery?.data?.success?.data as Order.Response[]) ?? [];

  const validAgencyRoles = new Set(['agency_owner', 'agency_project_manager', 'agency_member']);

  const agencyStatusesQuery = useQuery({
    queryKey: ['statuses'],
    queryFn: async () =>
      await getAgencyStatuses(organizationOrders?.[0]?.agency_id),
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

  let agencyMembers = agencyMembersQuery?.data?.data ?? [];

  agencyMembers =
    agencyMembers?.map((member) => ({
      ...member,
      role: member.role.toLowerCase(),
      user_settings: {
        picture_url: member.picture_url,
        name: member.name,
      },
    })) ?? [];

  const { orderDateMutation, orderAssignsMutation } = useUserOrderActions();
  const actions = {
    updateOrderDate: orderDateMutation,
    updateOrderAssigns: orderAssignsMutation,
  };
  const additionalData = {
    orderAgencyMembers: agencyMembers,
  };
  const hasPermission = () => {
    return validAgencyRoles.has(workspace?.role ?? '');
  }
  const columns = useColumns('orders', {
    data: additionalData,
    actions: actions,
    hasPermission,
  });
 
  const { currentStats, previousStats } = useOrderStats(organizationOrders);

  if (
    agencyMembersQuery.isLoading ||
    agencyStatusesQuery.isLoading ||
    organizationOrdersQuery.isLoading
  )
    return <div>Loading...</div>;
  return (
    <AgencyStatusesProvider initialStatuses={agencyStatuses}>
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
          data={organizationOrders}
          columns={columns}
          filterKey={'title'}
          emptyStateComponent={
            <EmptyState
              title={t('orders:empty.organization.title')}
              description={t('orders:empty.organization.description')}
              imageSrc="/images/illustrations/Illustration-box.svg"
            />
          }
        />
      </div>
    </AgencyStatusesProvider>
  );
}
