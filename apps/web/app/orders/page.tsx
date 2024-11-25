import { getUserRole } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';
import { getOrders } from 'node_modules/@kit/team-accounts/src/server/actions/orders/get/get-order';
import { getAgencyStatuses } from 'node_modules/@kit/team-accounts/src/server/actions/statuses/get/get-agency-statuses';
import { PageBody } from '@kit/ui/page';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { OrderList } from './components/orders-list';
import { PageHeader } from '../components/page-header';
import { TimerContainer } from '../components/timer-container';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('orders:title'),
  };
};

async function OrdersPage() {
  const ordersData = await getOrders().catch((err) => console.error(err));
  const agencyId = ordersData?.[0]?.agency_id;
  const agencyStatuses = await getAgencyStatuses(agencyId).catch((err) => console.error(err)).catch(() => []);
  const processedOrders =
    ordersData?.map((order) => ({
      ...order,
      customer_organization: order.organization.name ?? '',
      customer_name: order.customer.name ?? '',
    })) ?? [];

  const role = await getUserRole().catch((err) => {
    console.error(`Error client, getting user role: ${err}`)
    return ''
  });

  return (
    <>
      <PageBody>
        <div className="p-[35px]">
          <PageHeader 
            title='orders:title'
            rightContent={
              <TimerContainer />
            }
          />
          <div>
            <OrderList orders={processedOrders ?? []} role={role} agencyStatuses={agencyStatuses ?? []}></OrderList>
          </div>
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(OrdersPage);
