import { use } from 'react';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { loadTeamWorkspace } from '~/home/[account]/_lib/server/team-account-workspace.loader';
import { createChatMessagesService } from '~/home/[account]/chat/_lib/server/chat-messages.service';
import { withI18n } from '~/lib/i18n/with-i18n';

import { ChatContainer } from '../_components/chat-container';

interface Props {
  params: {
    account: string;
    referenceId: string;
  };

  searchParams: {
    content?: string;
  };
}

function ChatPage(props: Props) {
  const { account } = use(loadTeamWorkspace(props.params.account));

  const client = getSupabaseServerComponentClient();
  const service = createChatMessagesService(client);

  const data = use(
    service.getMessages({
      chatReferenceId: props.params.referenceId,
      page: 0,
    }),
  );

  const messages = data.map((message) => {
    const createdAt = message.createdAt
      ? new Date(message.createdAt)
      : undefined;

    return {
      ...message,
      createdAt,
    };
  });

  return (
    <ChatContainer
      content={props.searchParams.content}
      referenceId={props.params.referenceId}
      accountId={account.id}
      messages={messages}
    />
  );
}

export default withI18n(ChatPage);
