'use client';

import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { useTranslation } from 'react-i18next';

import EmptyState from '~/components/ui/empty-state';

import { useChat } from './context/chat-context';

export default function ChatEmptyState() {
  const { t } = useTranslation('chats');
  const { setIsChatCreationDialogOpen } = useChat();


  return (
    <EmptyState
      title={t('empty.title')}
      description={t('empty.description')}
      imageSrc="/images/illustrations/Illustration-box.svg"
      button={
        <ThemedButton onClick={() => setIsChatCreationDialogOpen(true)}>
          {t('newChat')}
        </ThemedButton>
      }

      className="h-full"
    />
  );
}

