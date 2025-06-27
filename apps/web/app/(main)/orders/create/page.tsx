import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { getBriefs } from '~/team-accounts/src/server/actions/briefs/get/get-brief';
import OrderCreationForm from './components/order-creation-form';
import { getUserRole } from '~/team-accounts/src/server/actions/members/get/get-member-account';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('orders:creation.title'),
  };
};

async function CreateOrderPage() {
  const briefs = await getBriefs();
  const userRole = await getUserRole().catch((err) => {
    console.error(`Error client, getting user role: ${err}`)
    return ''
  });

  return (
    <PageBody className="flex h-screen max-h-full min-h-0 flex-1 flex-col">
      <div className="mb-[32px] flex w-full items-center justify-between max-w-7xl mx-auto">
        <h2
          className={
            'font-inter text-[20px] font-semibold leading-8 text-gray-900'
          }
        >
          <Trans i18nKey={'orders:creation.title'} />
        </h2>
      </div>

      <OrderCreationForm briefs={briefs} userRole={userRole} />
    </PageBody>
  );
}

export default withI18n(CreateOrderPage);