import { PageBody } from '@kit/ui/page';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { getServicesByOrganizationId } from '~/server/actions/services/get-services';

import { PageHeader } from '../../components/page-header';
// import AddServiceButton from './components/add-button';
import ServicesTable from './components/table';
import AddServiceButton from './components/add-button';


export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('services:serviceTitle');

  return {
    title,
  };
};


async function ServicesPage() {

  const initialServices = await getServicesByOrganizationId({
    pagination: {
      page: 1,
      limit: 100,
    },
  });
  return (
    <PageBody>
      <PageHeader
        title="services:title"
        className="w-full"
        rightContent={<AddServiceButton />}
      />
      <ServicesTable initialData={initialServices} />
    </PageBody>
  );
}

export default withI18n(ServicesPage);
