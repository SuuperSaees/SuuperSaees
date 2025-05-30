import { PageBody } from '@kit/ui/page';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { PageHeader } from '../../components/page-header';
import { TimerContainer } from '../../components/timer-container';
import AddServiceButton from './components/add-button';
import ServicesTable from './components/table';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error('Stripe public key is not defined in environment variables');
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('services:serviceTitle');

  return {
    title,
  };
};

function ServicesPage() {
  return (
    <PageBody>
      <PageHeader
        title="services:title"
        rightContent={<TimerContainer />}
        className="w-full"
      >
        <h2 className="text-xl font-medium">Services</h2>
        <AddServiceButton />
      </PageHeader>

      <ServicesTable />
    </PageBody>
  );
}

export default withI18n(ServicesPage);
