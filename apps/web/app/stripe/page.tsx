import { PageBody } from '@kit/ui/page';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
// import UpdateStripeFormContainer from './components/add-stripe-container'
import PayContainer from './components/pay-container';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('services:serviceTitle');

  return {
    title,
  };
};

function StripePage() {
  return (
    <>
      <PageBody>
        <PayContainer />
      </PageBody>
    </>
  );
}

export default withI18n(StripePage);
