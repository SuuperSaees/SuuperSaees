'use client';

import { Members } from '~/lib/members.types';

import ChatList from './chat-list';
import ChatSearchHeader from './chat-search-header';
import { Account } from '~/lib/account.types';

export default function ChatInbox({
  agencyTeam,
  clientOrganization,
}: {
  agencyTeam: Members.Organization;
  clientOrganization?: Account.Type;

}) {
  return (
    <div className="flex h-full flex-col">
      <ChatSearchHeader agencyTeam={agencyTeam} clientOrganization={clientOrganization} />
      <ChatList />
    </div>
  );
}
