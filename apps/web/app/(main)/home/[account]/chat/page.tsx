import { use } from 'react';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { createTeamAccountsApi } from '@kit/team-accounts/api';

import { withI18n } from '~/lib/i18n/with-i18n';

import { ChatContainer } from './_components/chat-container';

interface Props {
  params: {
    account: string;
  };
}

function ChatPage(props: Props) {
  const teamAccountsApi = createTeamAccountsApi(
    getSupabaseServerComponentClient(),
  );

  const account = use(teamAccountsApi.getTeamAccount(props.params.account));

  return (
    <ChatContainer referenceId={''} accountId={account.id} messages={[]} />
  );
}

export default withI18n(ChatPage);
