import { use } from 'react';

import { NotificationsPopover } from '@kit/notifications/components';

import featuresFlagConfig from '~/config/feature-flags.config';

import { loadUserWorkspace } from '../_lib/server/load-user-workspace';

export function UserNotifications() {
  const { user } = use(loadUserWorkspace());

  if (!featuresFlagConfig.enableNotifications) {
    return null;
  }

  return (
    <NotificationsPopover
      accountIds={[user.id]}
      realtime={featuresFlagConfig.realtimeNotifications}
    />
  );
}
