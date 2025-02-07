import { Suspense } from 'react';

import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';
import { getTeams } from '~/server/actions/team/team.action';

import ChatInbox from './components/chat-inbox';
import ChatThread from './components/chat-thread';
import { ChatProvider } from './components/context/chat-context';

export default async function MessagesPage() {
  const {
    organization,
    agency,
  } = await loadUserWorkspace();
  // Always bring the agency members and the organization data

  // This because this data is always needed for the messages page and not changes frequently
  const isAgency = typeof agency === 'object';
  const agencyId = isAgency && agency ? agency.id : organization?.id;
  const teams = await getTeams({
    organizationIds: [agencyId ?? ''],
    includeMembers: true,
  });

  return (
    <ChatProvider >
      <div className="flex h-full border-t">
        <div className="flex w-[380px] flex-col border-r bg-white">
          <Suspense fallback={<div>Loading...</div>}>
            <ChatInbox teams={teams} />
          </Suspense>
        </div>
        <div className="flex flex-1 flex-col bg-white">
          <Suspense fallback={<div>Loading...</div>}>
            <ChatThread teams={teams} />
          </Suspense>
        </div>
      </div>
    </ChatProvider>

  );
}
