'use client';

import { useTranslation } from 'react-i18next';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import { Account } from '~/lib/account.types';
import { Members } from '~/lib/members.types';

// import { useRouter } from 'next/navigation';
import { useChat } from './context/chat-context';
import CreateOrganizationsChatDialog from './create-chat-dialog';
import { PageMobileNavigation } from '@kit/ui/page';
import { HomeMobileNavigation } from '~/(main)/home/(user)/_components/home-mobile-navigation';

export default function ChatSearchHeader({
  agencyTeam,
  clientOrganization,
}: {
  agencyTeam: Members.Organization;
  clientOrganization?: Account.Type;  
}) {
  const { t } = useTranslation('chats');

  const {
    createChatMutation,
    isChatCreationDialogOpen,
    setIsChatCreationDialogOpen,
    setSearchQuery,
  } = useChat();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  };
  const agencyOrganization = agencyTeam;
  const agencyMembers = agencyTeam.members ?? [];

  // Permissions to create a chat
  const { workspace: userWorkspace } = useUserWorkspace();
  const role = userWorkspace?.role;
  const validAgencyRoles = ['agency_owner', 'agency_project_manager'];
  const validClientRoles = ['client_owner'];
  const isValidClientRole = validClientRoles.includes(role ?? '');
  const canCreateChat =
    validAgencyRoles.includes(role ?? '') ||
    validClientRoles.includes(role ?? '');

  return (
    <div className="relative flex flex-col border-b">
      <div className="flex min-h-9 items-center justify-between gap-2 border-b border-gray-200 px-6.5 py-3">
        <PageMobileNavigation className={"flex items-center justify-between w-fit" }>
          <HomeMobileNavigation />
        </PageMobileNavigation>
        <h2 className="font-inter text-xl font-medium text-primary-900">
          {t('chats')}
        </h2>
        {/*  Drop down menu */}
        {agencyOrganization && canCreateChat && (
          <CreateOrganizationsChatDialog
            createChatMutation={createChatMutation}
            agencyMembers={agencyMembers}
            agencyOrganization={agencyOrganization}
            isChatCreationDialogOpen={isChatCreationDialogOpen}
            setIsChatCreationDialogOpen={setIsChatCreationDialogOpen}
            clientOrganization={
              isValidClientRole ? clientOrganization : undefined
            }
          />
        )}
      </div>

      <div className="relative flex items-center justify-between gap-2">
        <input
          type="text"
          placeholder={t('search')}
          className="w-full bg-white px-4 py-2 pl-10 outline-none"
          onChange={handleSearch}
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
    </div>
  );
}
