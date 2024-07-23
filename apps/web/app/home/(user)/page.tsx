import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { HomeAccountsList } from './_components/home-accounts-list';
import { HomeLayoutPageHeader } from './_components/home-page-header';
import { HomeAccountMetrics } from './_components/home-account-metrics';


export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('account:homePage');

  return {
    title,
  };
};

function UserHomePage() {
  return (
    <>
      <HomeLayoutPageHeader
        title="Te damos la bienvenida, Samuel"
        description=""
      />

      <PageBody className={'space-y-4'}>
        <HomeAccountMetrics></HomeAccountMetrics>

      </PageBody>
    </>
  );
}


export default withI18n(UserHomePage);
