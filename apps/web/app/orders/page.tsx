import { BellIcon } from '@radix-ui/react-icons';
import { getOrders } from 'node_modules/@kit/team-accounts/src/server/actions/orders/get/get-order';

import { Button } from '@kit/ui/button';
import { PageBody } from '@kit/ui/page';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { OrderList } from './components/orders-list';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('orders:title'),
  };
};

// const capitalizeFirstLetter = (string: string) => {
//   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
// };

async function UserHomePage() {
  const ordersData = await getOrders();
  const processedOrders =
    ordersData.map((order) => ({
      ...order,
      customer_organization: order.organization.name ?? '',
      customer_name: order.customer.name ?? '',
    })) ?? [];

  // console.log('processedOrders', processedOrders);

  return (
    <>
      <PageBody>
        <div className="p-[35px]">
          <div className="mb-[32px] flex items-center justify-between">
            <div className="flex-grow">
              <span>
                <div className="text-primary-900 font-inter text-[36px] font-semibold leading-[44px] tracking-[-0.72px]">
                  Pedidos
                </div>
              </span>
            </div>
            <div className="flex space-x-4">
              <span>
                <Button variant="outline">
                  Tu prueba gratuita termina en xx dias
                </Button>
              </span>
              <span>
                <Button variant="outline" size="icon">
                  <BellIcon className="h-4 w-4" />
                </Button>
              </span>
            </div>
          </div>
          <div>
            <OrderList orders={processedOrders ?? []}></OrderList>
          </div>
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(UserHomePage);
