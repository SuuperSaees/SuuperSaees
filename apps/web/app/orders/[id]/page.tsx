import { getPropietaryOrganizationIdOfOrder } from 'node_modules/@kit/team-accounts/src/server/actions/orders/get/get-order';
import { Metadata } from 'next';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { getOrderById } from '../../../../../packages/features/team-accounts/src/server/actions/orders/get/get-order';
import AsideOrderInformation from './components/aside-order-information';
import { OrderHeader } from './components/order-header';
import { OrderTabs } from './components/order-tabs';
import { ActivityProvider } from './context/activity-context';
import { Order } from '~/lib/order.types';
import { getAgencyStatuses } from '~/team-accounts/src/server/actions/statuses/get/get-agency-statuses';
import { getDomainByUserId } from '~/multitenancy/utils/get/get-domain';
import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';
import { redirect } from 'next/navigation';
import { getTags } from '~/server/actions/tags/tags.action';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const order = await getOrderById(Number(params.id)).catch((err) =>
    console.error(err),
  ) as Order.Relational;
  const agency = order?.agency_id ? await getAgencyStatuses(order.agency_id).catch((err) => null) : null;
  
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
  const order = await getOrderById(Number(id)).catch((err) =>
    console.error(err),
  ) as Order.Relational;

  const agencyStatuses = await getAgencyStatuses(order?.agency_id).catch((err) =>
    console.error(err),
  ) 

  const orderAgencyTags = await getTags(order?.agency_id, order?.id).catch((err) =>
    console.error(err),
  )

  const agencyTags = await getTags(order?.agency_id).catch((err) =>
    console.error(err),
  )

  // console.log(agencyTags);
  const organizationId = await getPropietaryOrganizationIdOfOrder(id).catch((err) => {
    console.error(`Error getting propietary organization id of order: ${err}`)
    return { organization: '' }
  });;
  const { user, workspace } = await loadUserWorkspace();
  const { organization: agency } = await getDomainByUserId(user.id ?? '').catch((err) => {
    console.error(`Error client, getting domain by user id: ${err}`)
    return { organization: null }
  });
  const i18n = await createI18nServerInstance();
  const ordersTitle = i18n.t('orders:title');
  const currentPath = [
    { title: ordersTitle },
    { title: order?.title ?? '', uuid: order?.uuid ?? '' },
  ];

  // const role = await getUserRole().catch((err) => {
  //   console.error(`Error client, getting user role: ${err}`)
  //   return ''
  // });
  
  const role = workspace?.role

  if(role === 'client_guest' && order?.visibility !== 'public'){
    return redirect('/orders');
  }

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
          <OrderHeader order={order} agencyStatuses={agencyStatuses ?? []} user={user} />
          <OrderTabs
            organizationId={
              organizationId
                ? { account_id: organizationId?.client_organization_id }
                : undefined
            }
            currentPath={currentPath}
            userRole={role}
            orderId={id}
            orderAgencyId={order?.agency_id ?? ''}
            agencyStatuses={agencyStatuses ?? []}
            agencyName={agency?.name ?? ''}
          />
        </div>
        <AsideOrderInformation className="hidden lg:flex " agencyStatuses={agencyStatuses ?? []} orderAgencyTags={ orderAgencyTags ?? []} agencyTags={ agencyTags ?? []}/>
    
      </div>
    </div>
      </ActivityProvider>
  );
}

export default withI18n(OrderDetailsPage);