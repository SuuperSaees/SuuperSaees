import { use } from 'react';

import { NotificationsPopover } from '@kit/notifications/components';

import featuresFlagConfig from '~/config/feature-flags.config';

import { loadTeamWorkspace } from '../_lib/server/team-account-workspace.loader';

export function AccountNotifications(params: { accountId: string }) {
  const { user, account } = use(loadTeamWorkspace(params.accountId));

  if (!featuresFlagConfig.enableNotifications) {
    return null;
  }

  return (
    <NotificationsPopover
      accountIds={[user.id, account.id]}
      realtime={featuresFlagConfig.realtimeNotifications}
    />
  );
}
