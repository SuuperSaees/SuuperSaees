'use client';

import { Members } from '~/lib/members.types';

import ChatList from './chat-list';
import ChatSearchHeader from './chat-search-header';

export default function ChatInbox({
  agencyTeam,
}: {
  agencyTeam: Members.Organization;
}) {
  return (
    <div className="flex h-full flex-col">
      <ChatSearchHeader agencyTeam={agencyTeam} />
      <ChatList />
    </div>
  );
}
