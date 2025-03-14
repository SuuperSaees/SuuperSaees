import { Metadata } from 'next';
import { cache } from 'react';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { getOrderById } from '../../../../../packages/features/team-accounts/src/server/actions/orders/get/get-order';
import AsideOrderInformation from './components/aside-order-information';
import { OrderHeader } from './components/order-header';
import { OrderTabs } from './components/order-tabs';
import { ActivityProvider } from './context/activity-context';
import { Order } from '~/lib/order.types';
import { getAgencyStatuses } from '~/team-accounts/src/server/actions/statuses/get/get-agency-statuses';
import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';
import { redirect } from 'next/navigation';
import { getTags } from '~/server/actions/tags/tags.action';

const getOrderByIdCached = cache(async (id: string): Promise<Order.Relational> => {
  try {
    return await getOrderById(Number(id)) as unknown as Order.Relational;
  } catch (err) {
    console.error('Error fetching order:', err);
    return {} as Order.Relational;
  }
});

const getAgencyStatusesCached = cache(async (agencyId: string) => {
  return getAgencyStatuses(agencyId).catch(err => {
    console.error('Error fetching agency statuses:', err);
    return [];
  });
});

const getTagsCached = cache(async (agencyId: string) => {
  return getTags(agencyId).catch(err => {
    console.error('Error fetching agency tags:', err);
    return [];
  });
});

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const order = await getOrderByIdCached(params.id);
  
  const title = order 
    ? `${order.id} - ${order.title}`
    : 'Order Details';
  
  return {
    title,
  };
}

async function OrderDetailsPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const [order, { workspace, organization, agency, user }, i18n] = await Promise.all([
    getOrderByIdCached(id),
    loadUserWorkspace(),
    createI18nServerInstance()
  ]);

  const role = workspace?.role;
  if(role === 'client_guest' && order?.visibility !== 'public'){
    return redirect('/orders');
  }

  const [agencyStatuses, agencyTags] = await Promise.all([
    getAgencyStatusesCached(order?.agency_id ?? ''),
    getTagsCached(order?.agency_id ?? '')
  ]);

  const organizationId = order?.client_organization_id;
  const agencyName = agency?.name ?? organization?.name ?? '';
  const orderAgencyTags = order?.tags;

  const ordersTitle = i18n.t('orders:title');
  const currentPath = [
    { title: ordersTitle },
    { title: order?.title ?? '', uuid: order?.uuid ?? '' },
  ];

  return (
      <ActivityProvider
        messages={order?.messages ?? []}
        files={order?.files ?? []}
        activities={order?.activities ?? []}
        reviews={order?.reviews ?? []}
        order={order}
        briefResponses={order?.brief_responses ?? []}
        userRole={role ?? ''}
      >
      <div className="flex h-full max-h-full w-full flex-col text-gray-700 overflow-y-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
      <div className="flex max-h-full h-full w-full justify-between">
    
        <div className="flex w-full min-w-0 flex-grow flex-col max-h-full h-full pt-2">
          <OrderHeader order={order} agencyStatuses={agencyStatuses ?? []} user={user} userRole={role ?? ''} />
          <OrderTabs
            organizationId={
              organizationId
                ? { account_id: organizationId }
                : undefined
            }
            currentPath={currentPath}
            userRole={role ?? ''}
            orderId={id}
            orderAgencyId={order?.agency_id ?? ''}
            agencyStatuses={agencyStatuses ?? []}
            agencyName={agencyName}
          />
        </div>
        <AsideOrderInformation className="hidden lg:flex " agencyStatuses={agencyStatuses ?? []} orderAgencyTags={ orderAgencyTags ?? []} agencyTags={ agencyTags ?? []}/>
    
      </div>
    </div>
      </ActivityProvider>
  );
}

export default withI18n(OrderDetailsPage);