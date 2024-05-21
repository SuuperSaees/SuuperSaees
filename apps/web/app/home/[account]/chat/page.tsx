import { use } from 'react';

import { loadTeamWorkspace } from '~/home/[account]/_lib/server/team-account-workspace.loader';
import { withI18n } from '~/lib/i18n/with-i18n';

import { ChatContainer } from './_components/chat-container';

interface Props {
  params: {
    account: string;
  };
}

function ChatPage(props: Props) {
  const { account } = use(loadTeamWorkspace(props.params.account));
  const accountId = account.id;

  return <ChatContainer referenceId={''} accountId={accountId} messages={[]} />;
}

export default withI18n(ChatPage);
