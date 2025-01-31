'use client';

import EmptyState from '~/components/ui/empty-state';
import { useTranslation } from 'react-i18next';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createChat } from '~/server/actions/chat/actions/chats/chat.actions';
import { useChat } from './context/chat-context';

export default function ChatEmptyState() {
    const { t } = useTranslation('chats');
    const { setActiveChat, setActiveChatData } = useChat();
    const queryClient = useQueryClient();
    const createChatMutation = useMutation({
      mutationFn: () => createChat({
        name: 'New Chat',
        user_id: 'acf26def-78fd-400f-bccc-c61a86137a1f',
        members: [],
        visibility: true,
        image: '',
        role: ['owner'],
      }),
      onSuccess: (response) => {
        console.log('response', response);
        const newChat = response.success?.data;
        if (newChat) {
          setActiveChat(newChat.id);
          setActiveChatData(newChat);
        }
        void queryClient.invalidateQueries({ queryKey: ['chats'] });
      },
    });


    return (
      <div className="h-full flex flex-col justify-center items-center bg-gray-50">
                <EmptyState
                title={t('empty.title')}
                description={t('empty.description')}
                imageSrc="/images/illustrations/Illustration-box.svg"
                button={
                    <ThemedButton onClick={() => createChatMutation.mutate()}>
                    {t('newChat')}
                    </ThemedButton>
                }
                />
      </div>
    );
  }