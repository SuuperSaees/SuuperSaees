import { cache } from 'react';

import { Metadata } from 'next';

import { redirect } from 'next/navigation';

import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { Order } from '~/lib/order.types';
import { getAgencyStatuses } from '~/server/actions/statuses/statuses.action';
import { getTags } from '~/server/actions/tags/tags.action';

import { getOrderById } from '../../../../../packages/features/team-accounts/src/server/actions/orders/get/get-order';
import AsideOrderInformation from './components/aside-order-information';
import { OrderHeader } from './components/order-header';
import { OrderTabs } from './components/order-tabs';
import { ActivityProvider } from './context/activity-context';

const getOrderByIdCached = cache(
  async (id: string): Promise<Order.Relational> => {
    try {
      return (await getOrderById(Number(id))) as unknown as Order.Relational;
    } catch (err) {
      console.error('Error fetching order:', err);
      return {} as Order.Relational;
    }
  },
);

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const order = await getOrderByIdCached(params.id);

  const title = order ? `${order.id} - ${order.title}` : 'Order Details';

  return {
    title,
  };
}

async function OrderDetailsPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const [order, { workspace, organization, agency, user }] = await Promise.all([
    getOrderByIdCached(id),
    loadUserWorkspace(),
    createI18nServerInstance(),
  ]);

  if (workspace?.role === 'client_guest' && order?.visibility !== 'public') {
    return redirect('/orders');
  }

  const [agencyStatuses, agencyTags] = await Promise.all([
    getAgencyStatuses(order?.agency_id ?? ''),
    getTags(order?.agency_id ?? ''),
  ]);

  const organizationId = order?.client_organization_id;
  const organizationName = order.client_organization?.name ?? '';
  const agencyName = agency?.name ?? organization?.name ?? '';
  const orderAgencyTags = order?.tags;

  const currentPath = [
    { title: organizationName, id: organizationId },
    { title: 'Projects', id: '' },
    { title: order?.title ?? '', id: order?.uuid ?? '' },
  ];

  const role = workspace?.role;

  if (role === 'client_guest' && order?.visibility !== 'public') {
    return redirect('/orders');
  }

  console.log('order', order);
  return (
    <ActivityProvider
      initialMessages={order?.messages ?? []}
      initialActivities={order?.activities ?? []}
      initialReviews={order?.reviews ?? []}
      initialOrder={order}
      briefResponses={order?.brief_responses ?? []}
      userRole={role ?? ''}
      clientOrganizationId={order.client_organization_id}
      agencyId={order?.agency_id ?? ''}
    >
      <div className="flex h-full max-h-full w-full flex-col overflow-y-auto text-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar]:w-2">
        <div className="flex h-full max-h-full w-full justify-between">
          <div className="flex h-full max-h-full w-full min-w-0 flex-grow flex-col">
            <OrderHeader
              agencyStatuses={agencyStatuses ?? []}
              user={user}
              userRole={role ?? ''}
            />
            <OrderTabs
              organizationId={
                organizationId ? { account_id: organizationId } : undefined
              }
              currentPath={currentPath}
              userRole={role ?? ''}
              orderId={id}
              orderAgencyId={order?.agency_id ?? ''}
              agencyStatuses={agencyStatuses ?? []}
              agencyName={agencyName}
            />
          </div>
          <AsideOrderInformation
            className="hidden lg:flex"
            agencyStatuses={agencyStatuses ?? []}
            orderAgencyTags={orderAgencyTags ?? []}
            agencyTags={agencyTags ?? []}
          />
        </div>
      </div>
    </ActivityProvider>
  );
}

export default withI18n(OrderDetailsPage);
