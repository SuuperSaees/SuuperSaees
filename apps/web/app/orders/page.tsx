import { getOrders } from 'node_modules/@kit/team-accounts/src/server/actions/orders/get/get-order';



import { PageBody } from '@kit/ui/page';



import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';



import { OrderList } from './components/orders-list';
import { getUserRole } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';



export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('orders:title'),
  };
};

// const capitalizeFirstLetter = (string: string) => {
//   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
// };


async function OrdersPage() {
  const i18n = await createI18nServerInstance();
  const ordersData = await getOrders().catch((err) => console.error(err));
  const processedOrders =
    ordersData?.map((order) => ({
      ...order,
      customer_organization: order.organization.name ?? '',
      customer_name: order.customer.name ?? '',
    })) ?? [];

  const role = await getUserRole();
  const pageTitle = i18n.t('orders:title');
  // console.log('processedOrders', processedOrders);

  return (
    <>
      <PageBody>
        <div className="p-[35px]">
          <div className="mb-[32px] flex items-center justify-between">
            <div className="flex-grow">
              <span>
                <div className="text-primary-900 font-inter text-[36px] font-semibold leading-[44px] tracking-[-0.72px]">
                  <h1>{i18n.t('orders:title')}</h1>
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

