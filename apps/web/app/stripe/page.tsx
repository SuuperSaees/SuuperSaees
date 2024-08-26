import { PageBody } from '@kit/ui/page';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
// import UpdateStripeFormContainer from './components/add-stripe-container'
import RegisterAccountContainer from './components/register-stripe-account-container';

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
        <RegisterAccountContainer />
      </PageBody>
    </>
  );
}

export default withI18n(StripePage);
