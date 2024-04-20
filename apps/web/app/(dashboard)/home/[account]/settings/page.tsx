import { TeamAccountSettingsContainer } from '@kit/team-accounts/components';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

import { AccountLayoutHeader } from '../_components/account-layout-header';
import { loadTeamWorkspace } from '../_lib/server/team-account-workspace.loader';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('teams:settings:pageTitle');

  return {
    title,
  };
};

interface Props {
  params: {
    account: string;
  };
}

const paths = {
  teamAccountSettings: pathsConfig.app.accountSettings,
};

async function TeamAccountSettingsPage(props: Props) {
  const data = await loadTeamWorkspace(props.params.account);

  const account = {
    id: data.account.id,
    name: data.account.name,
    pictureUrl: data.account.picture_url,
    slug: data.account.slug,
    primaryOwnerUserId: data.account.primary_owner_user_id,
  };

  return (
    <>
      <AccountLayoutHeader
        title={<Trans i18nKey={'teams:settings.pageTitle'} />}
        description={<Trans i18nKey={'teams:settings.pageDescription'} />}
        account={props.params.account}
      />

      <PageBody>
        <div
          className={
            'container flex w-full max-w-2xl flex-1 flex-col items-center p-0'
          }
        >
          <TeamAccountSettingsContainer account={account} paths={paths} />
        </div>
      </PageBody>
    </>
  );
}

export default TeamAccountSettingsPage;
