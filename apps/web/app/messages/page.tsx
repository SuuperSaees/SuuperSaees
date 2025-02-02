import ChatInbox from './components/chat-inbox';
import ChatThread from './components/chat-thread';
import { Suspense } from 'react';
import { ChatProvider } from './components/context/chat-context';
import { getOrganizationByUserId } from '~/team-accounts/src/server/actions/organizations/get/get-organizations';
import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';
import { getTeams } from '~/server/actions/team/team.action';

export default async function MessagesPage() {
  const { workspace: userWorkspace } = await loadUserWorkspace();
  const userOrganization = await getOrganizationByUserId(userWorkspace.id ?? '');
  const teams = await getTeams({ organizationId: userOrganization.id ?? '', role: userWorkspace.role ?? '' });

  return (
    <ChatProvider>
      <div className="h-full flex border-t">
        <div className="w-[380px] border-r flex flex-col bg-white">
          <Suspense fallback={<div>Loading...</div>}>
            <ChatInbox userId={userWorkspace.id ?? ''}/>
          </Suspense>
        </div>
        <div className="flex-1 flex flex-col bg-white">

          <Suspense fallback={<div>Loading...</div>}>
            <ChatThread teams={teams} userId={userWorkspace.id ?? ''} />
          </Suspense>
        </div>
      </div>
    </ChatProvider>
  );
}