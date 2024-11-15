import { getUserRole } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';
import { getPropietaryOrganizationIdOfOrder } from 'node_modules/@kit/team-accounts/src/server/actions/orders/get/get-order';

import { PageBody } from '@kit/ui/page';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { getOrderById } from '../../../../../packages/features/team-accounts/src/server/actions/orders/get/get-order';
import AsideOrderInformation from './components/aside-order-information';
import { OrderHeader } from './components/order-header';
import { OrderTabs } from './components/order-tabs';
import { ActivityProvider } from './context/activity-context';
import { Order } from '~/lib/order.types';
import { getAgencyStatuses } from '~/team-accounts/src/server/actions/statuses/get/get-agency-statuses';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('orders:details.title'),
    // You can add more metadata here if needed
  };
};

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
  const organizationId = await getPropietaryOrganizationIdOfOrder(id);
  const i18n = await createI18nServerInstance();
  const ordersTitle = i18n.t('orders:title');
  const currentPath = [
    { title: ordersTitle },
    { title: order?.title ?? '', uuid: order?.uuid ?? '' },
  ];
  const role = await getUserRole().catch((err) => {
    console.error(`Error client, getting user role: ${err}`)
    return ''
  });

  return (
    <PageBody className="h-full max-h-full min-h-0 flex-grow lg:px-0">
      <ActivityProvider
        messages={order?.messages ?? []}
        files={order?.files ?? []}
        activities={order?.activities ?? []}
        reviews={order?.reviews ?? []}
        order={order}
        userRole={role}
      >
        

    <div className="flex h-full max-h-full w-full flex-col text-gray-700">
      <div className="flex max-h-full h-full w-full justify-between">
    
        <div className="flex w-full min-w-0 flex-grow flex-col max-h-full h-full pr-[2rem] pt-2">
          <OrderHeader order={order} />
          <OrderTabs
            organizationId={
              organizationId
                ? { account_id: organizationId.client_organization_id }
                : undefined
            }
            currentPath={currentPath}
            userRole={role}
            orderId={id}
            orderAgencyId={order?.agency_id ?? ''}
          />
        </div>
        <AsideOrderInformation order={order} className="hidden lg:flex " agencyStatuses={agencyStatuses ?? []}/>
    
      </div>
    </div>
      </ActivityProvider>
    </PageBody>
  );
}

export default withI18n(OrderDetailsPage);
