'use client';

import { SquarePen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createChat } from '~/server/actions/chats/chat.action';
import { Button } from '@kit/ui/button';
import { useChat } from './context/chat-context';

export default function ChatSearchHeader() {
  // const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation('chats');
  const { setActiveChat, setActiveChatData } = useChat();

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
      const newChat = response;
      if (newChat) {
        setActiveChat(newChat.id);
        setActiveChatData(newChat);
      }
      void queryClient.invalidateQueries({ queryKey: ['chats'] });

    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Searching:', e.target.value);
  };


  return (
    <div className="p-4 border-b">
      <div className="relative mt-4">
        <div className="flex items-center gap-2 justify-between mb-4">
          <h2 className="text-2xl font-semibold">{t('chats')}</h2>
          {/*  Drop down menu */}
          <Button onClick={() => createChatMutation.mutate()} variant="ghost">
            <SquarePen className="cursor-pointer text-gray-500" /> 
          </Button>
        </div>
        <div className="relative"> 
        <input
          type="text"
          placeholder={t('search')}
          className="w-full px-4 py-2 pl-10 bg-gray-100 rounded-lg outline-none"
          onChange={handleSearch}
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
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