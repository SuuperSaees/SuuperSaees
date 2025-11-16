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
  initialChats?: Chats.TypeWithRelations[];
  activeChat?: Chats.Type;
  setActiveChat?: (chat: Chats.Type | null) => void;
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
  initialChats,
  setMessages,
  activeChat,
  setActiveChat,
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
    onMutate: async (newName: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['chats'] });
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous values
      const previousChats = queryClient.getQueryData<Chats.TypeWithRelations[]>(
        ['chats'],
      );
      const previousChat = activeChat ?? queryClient.getQueryData(queryKey);

      // Optimistically update both caches
      queryClient.setQueryData(['chats'], (old: Chats.TypeWithRelations[]) => {
        return old.map((chat) =>
          chat.id === chatId ? { ...chat, name: newName } : chat,
        );
      });

      if (setActiveChat && activeChat) {
        setActiveChat({ ...activeChat, name: newName });
      } else {
        queryClient.setQueryData(queryKey, (old: Chats.TypeWithRelations) =>
          old ? { ...old, name: newName } : old,
        );
      }

      return { previousChats, previousChat };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
      toast.success('Chat name updated successfully');
      router.refresh();
    },
    onError: (_error, _variables, context) => {
      toast.error('Failed to update chat name');
      if (context) {
        queryClient.setQueryData(['chats'], context.previousChats);
        !setActiveChat
          ? queryClient.setQueryData(queryKey, context.previousChat)
          : setActiveChat(context.previousChat as Chats.Type);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['chats'] });
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  /**
   * Mutation for deleting a chat
   * Handles state updates, notifications and redirects
   */
  const deleteChatMutation = useMutation({
    mutationFn: deleteChat,
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['chats'] });
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous values
      const previousChats = queryClient.getQueryData<Chats.TypeWithRelations[]>(
        ['chats'],
      );
      const previousChat = activeChat ?? queryClient.getQueryData(queryKey);

      // Optimistically update both caches
      queryClient.setQueryData(['chats'], (old: Chats.TypeWithRelations[]) => {
        return old.filter((chat) => chat.id !== chatId);
      });

      !setActiveChat
        ? queryClient.setQueryData(queryKey, null)
        : setActiveChat(null);

      return { previousChats, previousChat };
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['chats'] });
      await queryClient.invalidateQueries({ queryKey });
      toast.success('Chat deleted successfully');
    },

    onError: (_error, _variables, context) => {
      toast.error('Failed to delete chat');
      if (context) {
        queryClient.setQueryData(['chats'], context.previousChats);
        queryClient.setQueryData(queryKey, context.previousChat);
      }
    },
  });

  /**
   * Mutation for creating a new chat
   * Sets the new chat as active on success
   */
  const createChatMutation = useMutation({
    mutationFn: ({
      name,
      members,
      image,
      clientOrganizationId,
      agencyId,
    }: {
      name: string;
      members: { id: string; role: string; visibility: boolean }[];
      image?: string;
      clientOrganizationId: string;
      agencyId: string;
    }) =>
      createChat({
        name,
        user_id: userId,
        chat_members: members.map((member) => ({
          chat_id: '',
          user_id: member.id,
          type: member.role === 'agency_owner' ? 'owner' : member.role === 'agency_project_manager' ? 'project_manager' : 'guest',
          visibility: member.visibility,
        })),
        visibility: true,
        image: image ?? '',
        client_organization_id: clientOrganizationId,
        agency_id: agencyId,
      }),
    onMutate: async ({ name, members, image }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['chats'] });

      // Snapshot the previous value
      const previousChats =
        queryClient.getQueryData<Chats.TypeWithRelations[]>(['chats']) ?? [];

      // Temporary chat id
      const tempChatId = `temp-${crypto.randomUUID()}`;
      // Create an optimistic chat
      const optimisticChat: Chats.TypeWithRelations = {
        id: tempChatId,
        name,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        visibility: true,
        image: image ?? '',
        messages: [],
        deleted_on: null,
        reference_id: null,
        settings: {},
        chat_members: members.map((member) => ({
          chat_id: tempChatId,
          user_id: member.id,
          type: 'guest' as const,
          visibility: member.visibility,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          id: member.id,
          deleted_on: null,
          settings: {},
        })),
      };

      // Optimistically update the cache
      queryClient.setQueryData(['chats'], [...previousChats, optimisticChat]);
      !setActiveChat
        ? queryClient.setQueryData(queryKey, optimisticChat)
        : setActiveChat(optimisticChat);

      return { previousChats };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context) {
        queryClient.setQueryData(['chats'], context.previousChats);
      }
      toast.error('Failed to create chat');
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['chats'] });
      toast.success('Chat created successfully');
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  /**
   * Mutation for updating chat members
   * Handles adding/updating member roles
   */
  const membersUpdateMutation = useMutation({
    mutationFn: ({
      selectedUserIds,
      agencyMembers,
    }: {
      selectedUserIds: string[];
      agencyMembers: { id: string; role: string }[];
    }) => {
      // Find agency members with special roles that should always be included
      const specialRoleMembers = agencyMembers.filter(member => 
        member.role === 'agency_owner' || member.role === 'agency_project_manager'
      );
      
      // Create set of selected user IDs for quick lookup
      const selectedUserIdsSet = new Set(selectedUserIds);
      
      // Map all members (selected + special roles)
      const allMemberIds = new Set([
        ...selectedUserIds,
        ...specialRoleMembers.map(member => member.id)
      ]);
      
      const members = Array.from(allMemberIds).map(userId => {
        const agencyMember = agencyMembers.find(m => m.id === userId);
        const isSpecialRole = agencyMember && (
          agencyMember.role === 'agency_owner' || 
          agencyMember.role === 'agency_project_manager'
        );
        
        // For special roles: visibility based on whether they're in selectedUserIds
        // For regular members: visibility is true (they were selected)
        const visibility = isSpecialRole 
          ? selectedUserIdsSet.has(userId)
          : true;
          
        // Map agency roles to chat member types
        let type: 'guest' | 'project_manager' | 'assistant' | 'owner' = 'guest';
        if (agencyMember) {
          if (agencyMember.role === 'agency_owner') {
            type = 'owner';
          } else if (agencyMember.role === 'agency_project_manager') {
            type = 'project_manager';
          }
        }
        
        return {
          user_id: userId,
          type,
          visibility,
        };
      });
      
      return upsertMembers({
        chat_id: chatId,
        members,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  /**
   * Query for fetching all chats
   * Sets initial active chat if none is selected
   */
  const chatsQuery = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await getChats(userId);
      return response;
    },
    initialData: initialChats,
  });

  /**
   * Query for fetching a specific chat by ID
   * Updates messages state with chat messages
   */
  const chatByIdQuery = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      if(!chatId) return null;
      const chat = await getChat(chatId);
      setMessages(chat?.messages ?? []);
      return chat;
    },
    // Only use initialData if the chatId matches the initial chat's ID
    initialData: initialChat?.id === chatId ? initialChat : undefined,
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
