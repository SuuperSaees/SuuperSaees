import { getUserRole } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';
import { getOrders } from 'node_modules/@kit/team-accounts/src/server/actions/orders/get/get-order';

import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { OrderList } from './components/orders-list';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('orders:title'),
  };
};

async function OrdersPage() {
  const ordersData = await getOrders().catch((err) => console.error(err));
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
          <div className="mb-[32px] flex items-center justify-between">
            <div className="flex-grow">
              <span>
                <div className="font-inter text-[30px] font-semibold leading-[44px] tracking-[-0.72px] text-primary-900">
                  <h1>
                    <Trans i18nKey={'orders:title'} />
                  </h1>
                </div>
              </span>
            </div>
          </div>
          <div>
            <OrderList orders={processedOrders ?? []} role={role}></OrderList>
          </div>
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(OrdersPage);
