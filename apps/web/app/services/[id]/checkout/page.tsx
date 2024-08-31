import { PageBody } from '@kit/ui/page';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { getServiceById } from '../../../../../../packages/features/team-accounts/src/server/actions/services/get/get-services';
import DetailsSide from './components/details';


export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('services:details.title'),
  };
};

async function ServiceCheckoutPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const service = await getServiceById(Number(id));
  // console.log(service)

  return (
    <PageBody className="lg:px-0">
      <div className="flex w-full flex-col text-gray-700">
        <div className="flex w-full justify-between gap-6">
          <DetailsSide service={service} />
        </div>
      </div>
    </PageBody>
  );
}

export default withI18n(ServiceCheckoutPage);