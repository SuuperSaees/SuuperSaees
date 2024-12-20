'use client';

import { useQuery } from '@tanstack/react-query';
import { isBefore } from 'date-fns';
import { subDays } from 'date-fns';
import { isAfter } from 'date-fns';
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
  const now = new Date();

  // Define Time Ranges
  const last30Days = subDays(now, 30);
  const last60Days = subDays(now, 60);

  // Split Orders into Periods
  const ordersCurrentPeriod = organizationOrders?.filter(
    (order) =>
      isAfter(new Date(order.created_at), last30Days) &&
      isBefore(new Date(order.created_at), now),
  );

  const ordersPreviousPeriod = organizationOrders?.filter(
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
