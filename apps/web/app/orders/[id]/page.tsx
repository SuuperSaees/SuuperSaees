import { PageBody } from '@kit/ui/page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { getOrderById } from '../../../../../packages/features/team-accounts/src/server/actions/orders/get/get-order';
import ActivityPage from './components/activity';
import AsideOrderInformation from './components/aside-order-information';
import DetailsPage from './components/details';
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
  const order = await getOrderById(Number(id)).catch((err) =>
    console.error(err),
  );
  const messages = order?.messages ? order.messages : [];
  const files = order?.files ? order.files : [];
  const activities = order?.activities ? order.activities : [];
  const reviews = order?.reviews ? order.reviews : [];

  return (
    <PageBody className="h-full max-h-full min-h-0 flex-grow lg:px-0">
      <h3 className="fixed top-20 md:top-20"><Trans i18nKey="details.orderId" /> {order?.id}</h3>
      <div className="flex h-full max-h-full w-full flex-col text-gray-700">
        <div className="flex h-full max-h-full w-full justify-between gap-6">
          <ActivityProvider
            messages={messages}
            files={files}
            activities={activities}
            reviews={reviews}
            order={order}
          >
            <div className="flex w-full min-w-0 flex-grow flex-col gap-6">

              <Tabs
                defaultValue="activity"
                className="flex h-full flex-grow flex-col gap-6"
              >
                <TabsList className="flex w-fit">
                  <TabsTrigger value="activity" >
                    <Trans i18nKey={'orders:details.navigation.activity'} />
                  </TabsTrigger>
                  <TabsTrigger value="details" >
                    <Trans i18nKey={'orders:details.navigation.details'} />
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                  <DetailsPage />
                </TabsContent>
                <TabsContent
                  value="activity"
                  className="h-full max-h-full min-h-0"
                >
                  <ActivityPage />
                </TabsContent>
              </Tabs>
            </div>
          </ActivityProvider>
          <AsideOrderInformation order={order} className="hidden lg:flex" />
        </div>
      </div>
    </PageBody>
  );
}

export default withI18n(OrderDetailsPage);