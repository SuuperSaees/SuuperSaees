import { PageBody } from '@kit/ui/page';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { getOrderById } from '../../../../../packages/features/team-accounts/src/server/actions/orders/get/get-order';
import ActivityPage from './components/activity';
import AsideOrderInformation from './components/aside-order-information';
import { ReviewDialog } from './components/review-dialog';
import { ActivityProvider } from './context/activity-context';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('orders:details.title'),
  };
};

async function OrderDetailsPage({
  params: { id },
}: {
  params: { id: string };
}) {
  // const orderDetail = mockedOrder;
  // On the future for better performance each request can be made individually
  const order = await getOrderById(Number(id));
  const messages = order.messages ? order.messages : [];
  const files = order.files ? order.files : [];
  const activities = order.activities ? order.activities : [];
  const reviews = order.reviews ? order.reviews : [];

  return (
    <PageBody className="lg:px-0">
      <div className="flex w-full flex-col text-gray-700">
        <ReviewDialog orderId={order.id} />
        <div className="flex w-full gap-6">
          <ActivityProvider
            messages={messages}
            files={files}
            activities={activities}
            reviews={reviews}
            order={order}
          >
            <ActivityPage />
          </ActivityProvider>
          <AsideOrderInformation order={order} />
        </div>
      </div>
    </PageBody>
  );
}

export default withI18n(OrderDetailsPage);
