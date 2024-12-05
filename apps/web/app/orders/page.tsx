import { getUserRole } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';
import { getOrders } from 'node_modules/@kit/team-accounts/src/server/actions/orders/get/get-order';
import { getAgencyStatuses } from 'node_modules/@kit/team-accounts/src/server/actions/statuses/get/get-agency-statuses';

import { PageBody } from '@kit/ui/page';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { PageHeader } from '../components/page-header';
import { TimerContainer } from '../components/timer-container';
import { AgencyStatusesProvider } from './components/context/agency-statuses-context';
import { OrderList } from './components/orders-list';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('orders:title'),
  };
};

async function OrdersPage() {
  const ordersData = await getOrders(true).catch((err) => console.error(err));
  const agencyId = ordersData?.[0]?.agency_id;
  const agencyStatuses = await getAgencyStatuses(agencyId ?? '')
    .catch((err) => console.error(err))
    .catch(() => []);


  const role = await getUserRole().catch((err) => {
    console.error(`Error client, getting user role: ${err}`);
    return '';
  });

  return (
    <>
      <AgencyStatusesProvider initialStatuses={agencyStatuses ?? []}>
        <PageBody>
          <div className="p-[35px]">
            <PageHeader
              title="orders:title"
              rightContent={<TimerContainer />}
            />

            <OrderList
              orders={ordersData ?? []}
              role={role}
              agencyStatuses={agencyStatuses ?? []}
            ></OrderList>
          </div>
        </PageBody>
      </AgencyStatusesProvider>
    </>
  );
}

export default withI18n(OrdersPage);
