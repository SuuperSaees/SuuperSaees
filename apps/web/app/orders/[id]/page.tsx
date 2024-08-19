import { PageBody } from '@kit/ui/page';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { getOrderById } from '../../../../../packages/features/team-accounts/src/server/actions/orders/get/get-order';
import ActivityPage from './components/activity';
import DetailsPage from './components/details';
import AsideOrderInformation from './components/aside-order-information';
import { ReviewDialog } from './components/review-dialog';
import { ActivityProvider } from './context/activity-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

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
        <div className="flex w-full gap-6 justify-between">
          <ActivityProvider
            messages={messages}
            files={files}
            activities={activities}
            reviews={reviews}
            order={order}
          >
            <div className='flex flex-col w-full'>
              <div className='border border-gray-500 rounded-lg px-[12px] py-[8px] mb-[16px]'>
                <span className='overflow-hidden text-gray-500 text-ellipsis font-inter text-md leading-6'>{order.title}</span>
              </div>
              <Tabs defaultValue="activity">
                <TabsList>
                  <TabsTrigger value='activity'>Activity</TabsTrigger>
                  <TabsTrigger value='details'>Details</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                  <DetailsPage />
                </TabsContent>
                <TabsContent value="activity">
                  <ActivityPage />
                </TabsContent>
              </Tabs>
            </div>
          </ActivityProvider>
          <AsideOrderInformation order={order} />
        </div>
      </div>
    </PageBody>
  );
}

export default withI18n(OrderDetailsPage);
