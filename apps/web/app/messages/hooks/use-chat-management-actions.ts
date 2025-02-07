import { Dispatch } from 'react';
import { SetStateAction } from 'react';

import { useRouter } from 'next/navigation';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Chats } from '~/lib/chats.types';
import { Message } from '~/lib/message.types';
import { upsertMembers } from '~/server/actions/chat-members/chat-members.action';
import {
  createChat,
  deleteChat,
  getChat,
  getChats,
  updateChat,
} from '~/server/actions/chats/chats.action';

/**
 * Props interface for useChatManagement hook
 * @interface ChatManagementActionsProps
 * @property {Function} setMessages - Function to update messages state
 * @property {string} userId - Current user ID
 * @property {string} chatId - ID of currently active chat
 * @property {string[]} queryKey - Query key for the chats
 * @property {GetChatByIdResponse} initialChat - Initial chat data
 */

interface ChatManagementActionsProps {
  chatId: string;
  setMessages:
    | Dispatch<SetStateAction<Message.Type[]>>
    | ((
        updater: Message.Type[] | ((prev: Message.Type[]) => Message.Type[]),
      ) => void);
  userId: string;
  queryKey?: string[];
  initialChat?: Chats.TypeWithRelations;
}

/**
 * Custom hook for managing chat operations like creating, updating and deleting chats
 * @param {ChatManagementActionsProps} props - Hook properties
 * @returns {Object} Object containing chat management mutations and queries
 */
export const useChatManagement = ({
  chatId,
  userId,
  queryKey = ['chats'],
  initialChat,
  setMessages,
}: ChatManagementActionsProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  /**
   * Mutation for updating chat name
   * Handles success/error notifications and cache invalidation
   */
  const updateChatMutation = useMutation({
    mutationFn: (name: string) =>
      updateChat({
        id: chatId,
        name,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
      toast.success('Chat name updated successfully');
      router.refresh();
    },
    onError: () => {
      toast.error('Failed to update chat name');
    },
  });

  /**
   * Mutation for deleting a chat
   * Handles state updates, notifications and redirects
   */
  const deleteChatMutation = useMutation({
    mutationFn: async () => {
      await deleteChat(chatId);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });

      toast.success('Chat deleted successfully');

      router.push('/messages');
    },
    onError: () => {
      toast.error('Failed to delete chat');
    },
  });

  /**
   * Mutation for creating a new chat
   * Sets the new chat as active on success
   */
  const createChatMutation = useMutation({
    mutationFn: ({ name, memberIds }: { name: string; memberIds: string[] }) =>
      createChat({
        name,
        user_id: userId,
        chat_members: memberIds.map((memberId) => ({
          chat_id: '',
          user_id: memberId,
          type: 'guest',
        })),
        visibility: true,
        image: '',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  /**
   * Mutation for updating chat members
   * Handles adding/updating member roles
   */
  const membersUpdateMutation = useMutation({
    mutationFn: (members: string[]) =>
      upsertMembers({
        chat_id: chatId,
        members: members.map((member) => ({
          user_id: member,
          type: 'guest',
        })),
      }),
  });

  /**
   * Query for fetching all chats
   * Sets initial active chat if none is selected
   */
  const chatsQuery = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await getChats(userId);

      if (!response) throw new Error('Failed to fetch chats');

      return response;
    },
  });

  /**
   * Query for fetching a specific chat by ID
   * Updates messages state with chat messages
   */
  const chatByIdQuery = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      const chat = await getChat(chatId ?? '');
      setMessages(chat?.messages ?? []);
      return chat;
    },
    initialData: initialChat,
    enabled: !!chatId,
  });

  return {
    chatsQuery,
    chatByIdQuery,
    updateChatMutation,
    deleteChatMutation,
    createChatMutation,
    membersUpdateMutation,
  };
};
