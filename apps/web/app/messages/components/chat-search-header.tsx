'use client';

import { useTranslation } from 'react-i18next';

import { Members } from '~/lib/members.types';

// import { useRouter } from 'next/navigation';
import { useChat } from './context/chat-context';
import CreateOrganizationsChatDialog from './create-chat-dialog';

export default function ChatSearchHeader({
  agencyTeam,
}: {
  agencyTeam: Members.Organization;
}) {
  // const router = useRouter();
  const { t } = useTranslation('chats');
  const { createChatMutation, isChatCreationDialogOpen, setIsChatCreationDialogOpen, setSearchQuery  } = useChat();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  };
  const agencyOrganization = agencyTeam;
  const agencyMembers = agencyTeam.members ?? [];

  return (
    <div className="border-b p-4">
      <div className="relative mt-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-2xl font-semibold">{t('chats')}</h2>
          {/*  Drop down menu */}
          {agencyOrganization && (
            <CreateOrganizationsChatDialog
              createChatMutation={createChatMutation}
              agencyMembers={agencyMembers}
              agencyOrganization={agencyOrganization}
              isChatCreationDialogOpen={isChatCreationDialogOpen}
              setIsChatCreationDialogOpen={setIsChatCreationDialogOpen}
            />
          )}
        </div>



        <div className="relative">
          <input
            type="text"
            placeholder={t('search')}
            className="w-full rounded-lg bg-gray-100 px-4 py-2 pl-10 outline-none"
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
    </div>
  );
}
