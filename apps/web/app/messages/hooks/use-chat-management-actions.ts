import { Dispatch } from 'react';
import { SetStateAction } from 'react';

import { useRouter } from 'next/navigation';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Chats } from '~/lib/chats.types';
import { Message } from '~/lib/message.types';
import { User } from '~/lib/user.types';
import { upsertMembers } from '~/server/actions/chat-members/chat-members.action';
import {
  createChat,
  deleteChat,
  getChatById,
  getChats,
  updateChat,
} from '~/server/actions/chats/chats.action';

/**
 * Props interface for useChatManagement hook
 * @interface ChatManagementActionsProps
 * @property {Function} setMessages - Function to update messages state
 * @property {string | null} activeChat - ID of currently active chat
 * @property {Chats.Type | null} activeChatData - Data of currently active chat
 * @property {Function} setActiveChat - Function to update active chat ID
 * @property {Function} setActiveChatData - Function to update active chat data
 * @property {Pick<User.Response, 'id' | 'name' | 'email' | 'picture_url'>} user - Current user information
 */
interface ChatManagementActionsProps {
  setMessages: Dispatch<SetStateAction<Message.Type[]>>;
  activeChat: string | null;
  activeChatData: Chats.Type | null;
  setActiveChat: Dispatch<SetStateAction<string | null>>;
  setActiveChatData: Dispatch<SetStateAction<Chats.Type | null>>;
  user: Pick<User.Response, 'id' | 'name' | 'email' | 'picture_url'>;
}

/**
 * Custom hook for managing chat operations like creating, updating and deleting chats
 * @param {ChatManagementActionsProps} props - Hook properties
 * @returns {Object} Object containing chat management mutations and queries
 */
export const useChatManagement = ({
  setMessages,
  activeChat,
  activeChatData,
  setActiveChat,
  setActiveChatData,
  user,
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
        id: activeChatData?.id.toString() ?? '',
        name,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['chats'] });
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
      setActiveChat(null);
      setActiveChatData(null);
      await deleteChat(activeChatData?.id.toString() ?? '');
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['chats'] });
      const chats = await queryClient.fetchQuery<Chats.Type[]>({
        queryKey: ['chats'],
      });
      toast.success('Chat deleted successfully');

      if (chats?.length > 0) {
        setActiveChat(chats[0]?.id.toString() ?? null);
        setActiveChatData(chats[0] ?? null);
      } else {
        setActiveChat(null);
        setActiveChatData(null);
      }
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
    mutationFn: () =>
      createChat({
        name: 'New Chat',
        user_id: user.id,
        members: [],
        visibility: true,
        image: '',
        role: ['owner'],
      }),
    onSuccess: (newChat) => {
      if (newChat) {
        setActiveChat(newChat.id);
        setActiveChatData(newChat);
      }
      void queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  /**
   * Mutation for updating chat members
   * Handles adding/updating member roles
   */
  const membersUpdateMutation = useMutation({
    mutationFn: (members: string[]) =>
      upsertMembers({
        chat_id: activeChatData?.id.toString() ?? '',
        members: members.map((member) => ({
          user_id: member,
          role: 'guest',
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
      const response = await getChats();
      if (!response) throw new Error('Failed to fetch chats');

      if (!activeChat && response.length > 0) {
        setActiveChat(response[0]?.id.toString() ?? '');
        setActiveChatData(response[0] ?? null);
        setMessages([]);
      }

      return response;
    },
  });

  /**
   * Query for fetching a specific chat by ID
   * Updates messages state with chat messages
   */
  const chatByIdQuery = useQuery({
    queryKey: ['chatById', activeChatData?.id.toString() ?? ''],
    queryFn: async () => {
      const chat = await getChatById(activeChatData?.id.toString() ?? '');
      setMessages(chat?.messages ?? []);
      return chat;
    },
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
