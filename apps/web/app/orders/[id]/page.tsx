import { getUserRole } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';
import { PageBody } from '@kit/ui/page';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { getOrderById } from '../../../../../packages/features/team-accounts/src/server/actions/orders/get/get-order';
import AsideOrderInformation from './components/aside-order-information';
import { OrderHeader } from './components/order-header';
import { ActivityProvider } from './context/activity-context';
import { OrderTabs } from './components/order-tabs';

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
  );
  const role = await getUserRole();
  return (
    <PageBody className="h-[100vh] max-h-full min-h-0 flex-grow lg:px-0">
      <ActivityProvider
        messages={order?.messages ?? []}
        files={order?.files ?? []}
        activities={order?.activities ?? []}
        reviews={order?.reviews ?? []}
        order={order!}
        userRole={role}
      >
        <OrderHeader order={order!} />

        <div className="flex h-full max-h-full w-full flex-col text-gray-700">
          <div className="flex h-full max-h-full w-full justify-between gap-6">
            <div className="flex w-full min-w-0 flex-grow flex-col gap-6">
              <OrderTabs />
            </div>
            <AsideOrderInformation order={order!} className="hidden lg:flex" />
          </div>
        </div>
      </ActivityProvider>
    </PageBody>
  );
}

export default withI18n(OrderDetailsPage);
