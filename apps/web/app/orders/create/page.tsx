import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { getClientBriefs } from '../../../../../packages/features/team-accounts/src/server/actions/briefs/get/get-brief';
import OrderCreationForm from './components/order-creation-form';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('orders:creation.title'),
  };
};

async function CreateOrderPage() {
  const briefs = await getClientBriefs();
  console.log('BRIEFStt', briefs.length);
  return (
    <PageBody className="mx-auto flex w-full max-w-7xl p-8">
      <div className="mb-[32px] flex w-full items-center justify-between">
        <h2
          className={
            'font-inter text-[30px] font-semibold leading-8 text-gray-900'
          }
        >
          <Trans i18nKey={'orders:creation.title'} />
        </h2>
      </div>

      <OrderCreationForm briefs={briefs} />
    </PageBody>
  );
}

export default withI18n(CreateOrderPage);
