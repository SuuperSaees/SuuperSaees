'use client';

import { useRouter } from 'next/navigation';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ChatMessages } from '~/lib/chat-messages.types';
import { Chats } from '~/lib/chats.types';
import { User } from '~/lib/user.types';
import { upsertMembers } from '~/server/actions/chat-members/chat-members.action';
import {
  createMessage,
  deleteMessage,
} from '~/server/actions/chat-messages/chat-messages.action';
import {
  createChat,
  getChatById,
  getChats,
  updateChat,
} from '~/server/actions/chats/chats.action';
import { deleteChat } from '~/server/actions/chats/chats.action';
import { ChatRoleType } from '~/server/actions/chats/middleware/validate_chat_role';
import { updateFile } from '~/team-accounts/src/server/actions/files/update/update-file';
import { generateUUID } from '~/utils/generate-uuid';

interface UseChatActionsProps {
  messages: ChatMessages.Type[];
  setMessages: (messages: ChatMessages.Type[]) => void;
  activeChat: string | null;
  activeChatData: Chats.Type | null;
  setActiveChatData: (chat: Chats.Type) => void;
  user: Pick<User.Response, 'id' | 'name' | 'email' | 'picture_url'>;
  setActiveChat: (chatId: string | null) => void;
}

const useChatActions = ({
  messages,
  setMessages,
  activeChatData,
  activeChat,
  setActiveChatData,
  user,
  setActiveChat,
}: UseChatActionsProps) => {
  console.log('USER ID', user);
  const queryClient = useQueryClient();
  const router = useRouter();
  const userId = user.id;
  // Add message mutation
  const addMessageMutation = useMutation({
    mutationFn: async ({
      content,
      fileIds,
      userId,
    }: {
      content: string;
      fileIds?: string[];
      userId: string;
    }) => {
      if (!activeChatData) throw new Error('No active chat');

      const messageData = {
        account_id: userId,
        content,
        chat_id: activeChatData.id,
        role: 'guest' as ChatRoleType,
      };

      const response = await createMessage(messageData);

      if (fileIds?.length) {
        await Promise.all(
          fileIds.map((fileId) => updateFile(fileId, response.id)),
        );
      }

      return response;
    },
    onMutate: async ({ content }) => {
      const tempId = generateUUID();

      const optimisticMessage: ChatMessages.Type = {
        content,
        chat_id: activeChatData?.id ?? '',
        account_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        visibility: 'public',
        temp_id: tempId,
        pending: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          picture_url: user.picture_url,
        },
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      return { optimisticMessage };
    },
    onError: (_, __, context) => {
      if (context?.optimisticMessage) {
        setMessages((prev) =>
          prev.filter(
            (msg) => msg.temp_id !== context.optimisticMessage.temp_id,
          ),
        );
      }
      toast.error('Failed to send message');
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: deleteMessage,
    onMutate: async (messageId) => {
      const previousMessages = messages;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, deleted_at: new Date().toISOString() }
            : msg,
        ),
      );

      return { previousMessages };
    },
    onError: (_, __, context) => {
      if (context?.previousMessages) {
        setMessages(context.previousMessages);
      }
      toast.error('Failed to delete message');
    },
    onSuccess: () => {
      toast.success('Message deleted successfully');
    },
  });

  const handleSendMessage = async (content: string, fileIds?: string[]) => {
    if (!activeChatData) return;

    try {
      await addMessageMutation.mutateAsync({ content, fileIds, userId });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleUpdateMutation = useMutation({
    mutationFn: async (value: string) => {
      await updateChat({
        id: activeChatData?.id.toString() ?? '',
        name: value,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['chats'] });
      toast.success('Chat name updated successfully');
      router.refresh();
    },
    onError: () => {
      toast.error('Failed to update chat name');
    },
  });

  const handleUpdate = async (value: string) => {
    if (!activeChatData) return;
    await Promise.resolve();
    handleUpdateMutation.mutate(value);
  };

  const handleDeleteMutation = useMutation({
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

      if (chats && chats.length > 0) {
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

  const handleMembersUpdateMutation = useMutation({
    mutationFn: async (members: string[]) => {
      await upsertMembers({
        chat_id: activeChatData?.id.toString() ?? '',
        members: members.map((member) => ({
          user_id: member,
          role: 'guest',
        })),
      });
    },
  });
  const chatsQuery = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await getChats();
      if (!response) throw new Error('Failed to fetch chats');

      // Set initial active chat if none selected
      if (!activeChat && response.length > 0) {
        setActiveChat(response[0]?.id.toString() ?? '');
        setActiveChatData(response[0] ?? null);
        // Initialize messages for first chat
        setMessages([]);
      }

      return response as Chats.Type[];
    },
  });

  const { data: chatById } = useQuery({
    queryKey: ['chatById', activeChatData?.id.toString() ?? ''],
    queryFn: async () => {
      const chat = await getChatById(activeChatData?.id.toString() ?? '');
      setMessages(chat.messages);
      return chat;
    },
  });

  const createChatMutation = useMutation({
    mutationFn: () =>
      createChat({
        name: 'New Chat',
        user_id: userId,
        members: [],
        visibility: true,
        image: '',
        role: ['owner'],
      }),

    onSuccess: (response) => {
      const newChat = response.success?.data;
      if (newChat) {
        setActiveChat(newChat.id);
        setActiveChatData(newChat);
      }
      void queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  return {
    addMessageMutation,
    deleteMessageMutation,
    handleMembersUpdateMutation,
    handleUpdate,
    handleDeleteMutation,
    handleSendMessage,
    handleUpdateMutation,
    chatById,
    createChatMutation,
    chatsQuery,
  };
};

export default useChatActions;
