'use client';

import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { useTranslation } from 'react-i18next';

import EmptyState from '~/components/ui/empty-state';

import { useChat } from './context/chat-context';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

export default function ChatEmptyState() {
  const { t } = useTranslation('chats');
  const { setIsChatCreationDialogOpen } = useChat();
  // Permissions to create a chat
  const { workspace: userWorkspace } = useUserWorkspace();
  const role = userWorkspace?.role;
  const validAgencyRoles = ['agency_owner', 'agency_project_manager'];
  const validClientRoles = ['client_owner']; 
  const canCreateChat = validAgencyRoles.includes(role ?? '') || validClientRoles.includes(role ?? '');

  return (
    <EmptyState
      title={t('empty.title')}
      description={t('empty.description')}
      imageSrc="/images/illustrations/Illustration-box.svg"
      button={
        canCreateChat && (
          <ThemedButton onClick={() => setIsChatCreationDialogOpen(true)}>
            {t('newChat')}
          </ThemedButton>
        )
      }


      className="h-full"
    />
  );
}

