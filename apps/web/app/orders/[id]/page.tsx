import { getUserRole } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';

import { PageBody } from '@kit/ui/page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { getOrderById } from '../../../../../packages/features/team-accounts/src/server/actions/orders/get/get-order';
import ActivityPage from './components/activity';
import AsideOrderInformation from './components/aside-order-information';
import DetailsPage from './components/details';
import { OrderHeader } from './components/order-header';
import { ActivityProvider } from './context/activity-context';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('orders:details.title'),
    // Puedes agregar más metadatos aquí si es necesario
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
        order={order}
        userRole={role}
      >
        <OrderHeader order={order!} />

        <div className="flex h-full max-h-full w-full flex-col text-gray-700">
          <div className="flex h-full max-h-full w-full justify-between gap-6">
            <div className="flex w-full min-w-0 flex-grow flex-col gap-6">
              <Tabs
                defaultValue="activity"
                className="flex h-full flex-grow flex-col gap-6"
              >
                <TabsList className="flex w-fit">
                  <TabsTrigger value="activity">
                    <Trans i18nKey={'orders:details.navigation.activity'} />
                  </TabsTrigger>
                  <TabsTrigger value="details">
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
            <AsideOrderInformation order={order} className="hidden lg:flex" />
          </div>
        </div>
      </ActivityProvider>
    </PageBody>
  );
}

export default withI18n(OrderDetailsPage);
