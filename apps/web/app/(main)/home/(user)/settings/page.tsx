import { use } from 'react';



import { PersonalAccountSettingsContainer } from '@kit/accounts/personal-account-settings';
import { PageBody } from '@kit/ui/page';

import featureFlagsConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';
import { loadUserWorkspace } from '../_lib/server/load-user-workspace';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { PageHeader } from '../../../../components/page-header';
import { TimerContainer } from '../../../../components/timer-container';
import WalletSummarySheet from '~/(credits)/components/wallet-summary-sheet';

const features = {
  enableAccountDeletion: featureFlagsConfig.enableAccountDeletion,
};

const paths = {
  callback: pathsConfig.auth.callback + `?next=${pathsConfig.app.accountHome}`,
};

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('account:settingsTab');
  
  return {
    title,
  };
};

function PersonalAccountSettingsPage() {
  const { user } = use(loadUserWorkspace());

  return (
    <PageBody>
        <PageHeader
          title='account:settingsTab'
          rightContent={
           <><TimerContainer /><WalletSummarySheet /></>
          }
        />

        <PersonalAccountSettingsContainer
          userId={user.id}
          features={features}
          paths={paths}
        />
    </PageBody>
  );
}

export default withI18n(PersonalAccountSettingsPage);

