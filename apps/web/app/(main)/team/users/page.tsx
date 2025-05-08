import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';


import { HomeAccountsList } from '~/home/(user)/_components/home-accounts-list';
import { HomeLayoutPageHeader } from '~/home/(user)/_components/home-page-header';
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

    </>
  );
}

export default withI18n(UserHomePage);
