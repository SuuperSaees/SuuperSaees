import { PageBody } from '@kit/ui/page';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
// import UpdateStripeFormContainer from './components/add-stripe-container'
import PlansContainer from './components/plans-container';


export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('billing:billingTitle');

  return {
    title,
  };
};

function StripePage() {
  return (
    <>
      <PageBody>
        <PlansContainer />
      </PageBody>
    </>
  );
}

export default withI18n(StripePage);
