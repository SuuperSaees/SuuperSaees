import { use } from 'react';



import { PersonalAccountSettingsContainer } from '@kit/accounts/personal-account-settings';
import { PageBody } from '@kit/ui/page';

import featureFlagsConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';
import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { Trans } from '@kit/ui/trans';
import { withI18n } from '~/lib/i18n/with-i18n';

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
      <div className="p-[35px]">
        <div className="mb-[32px] flex items-center justify-between">
          <div className="flex-grow">
            <span>
              <div className="text-primary-900 font-inter text-[30px] font-semibold leading-[44px] tracking-[-0.72px]">
                <Trans i18nKey={'account:settingsTab'} />
              </div>
            </span>
          </div>
        </div>

        <PersonalAccountSettingsContainer
          userId={user.id}
          features={features}
          paths={paths}
        />
      </div>
    </PageBody>
  );
}

export default withI18n(PersonalAccountSettingsPage);

