'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import { ChatMembers } from '~/lib/chat-members.types';
import { ChatMessages } from '~/lib/chat-messages.types';
import { Chats } from '~/lib/chats.types';
// import { useChatSubscriptions } from '~/messages/hooks/use-chat-subscription';
import { SubscriptionPayload, TableName } from '~/lib/chats.types';
import { Json } from '~/lib/database.types';
import { Message } from '~/lib/message.types';
import useChatActions from '~/messages/hooks/use-chat-actions';
import { DeleteMessagePayload } from '~/server/actions/chat-messages/chat-messages.interface';
import {
  ChatPayload,
  GetChatByIdResponse,
} from '~/server/actions/chats/chats.interface';
import { getUserById } from '~/team-accounts/src/server/actions/members/get/get-member-account';

interface ChatContextType {
  // Active chat management
  activeChat: string | null;
  setActiveChat: (chatId: string | null) => void;
  activeChatData: Chats.Type | null;
  setActiveChatData: (chat: Chats.Type | null) => void;

  // Messages management
  messages: ChatMessages.Type[];
  setMessages: (messages: ChatMessages.Type[]) => void;
  members: ChatMembers.Type[];
  addMessage: (params: {
    content: string;
    fileIds?: string[];
    userId: string;
  }) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  isLoading: boolean;
  addMessageMutation: UseMutationResult<void, Error, Message.Insert>;
  deleteMessageMutation: UseMutationResult<void, Error, DeleteMessagePayload>;
  handleMembersUpdateMutation: UseMutationResult<
    void,
    Error,
    string[],
    unknown
  >;
  handleUpdate: (value: string) => Promise<void>;
  handleDeleteMutation: UseMutationResult<void, Error, void, unknown>;
  handleSendMessage: (content: string, fileIds?: string[]) => Promise<void>;
  handleUpdateMutation: UseMutationResult<void, Error, string, unknown>;
  chatById: GetChatByIdResponse | undefined;
  createChatMutation: UseMutationResult<void, Error, void, ChatPayload>;
  chats: UseQueryResult<
    {
      created_at: string | null;
      deleted_on: string | null;
      id: string;
      name: string;
      reference_id: string;
      settings: Json;
      updated_at: string | null;
      user_id: string;
      visibility: boolean;
    }[],
    Error
  >;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({
  children,
  initialMessages = [],
  initialMembers = [],
}: {
  children: ReactNode;
  initialMessages?: ChatMessages.Type[];
  initialMembers?: ChatMembers.Type[];
}) {
  // Active chat state
  const [activeChat, setActiveChat] = useState<string | null>(null);

  const [activeChatData, setActiveChatData] = useState<Chats.Type | null>(null);

  // Messages and members state
  const [messages, setMessages] =
    useState<ChatMessages.Type[]>(initialMessages);
  const [members, setMembers] = useState<ChatMembers.Type[]>(initialMembers);
  const [isLoading, setIsLoading] = useState(false);
  const { workspace: currentUser, user } = useUserWorkspace();
  const {
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
  } = useChatActions({
    messages,
    setMessages,
    activeChatData,
    activeChat,
    setActiveChatData,
    user: {
      id: currentUser?.id ?? '',
      name: currentUser?.name ?? '',
      email: user?.email ?? '',
      picture_url: currentUser?.picture_url ?? '',
    },
    setActiveChat,
  });

  // Reconcile messages helper
  const reconcileMessages = (
    currentMessages: ChatMessages.Type[],
    newMessage: ChatMessages.Type,
  ) => {
    if (!currentMessages.some((msg) => msg.id === newMessage.id)) {
      const existingIndex = currentMessages.findIndex(
        (msg) => msg.temp_id === newMessage.temp_id,
      );

      if (existingIndex !== -1) {
        return currentMessages.map((msg, index) =>
          index === existingIndex ? newMessage : msg,
        );
      }
      return [...currentMessages, newMessage];
    }
    return currentMessages;
  };

  // Reconcile data with user information
  const reconcileData = useCallback(
    async (
      payload: SubscriptionPayload,
      currentDataStore: any,
      tableName: TableName,
    ) => {
      if (Array.isArray(currentDataStore)) {
        let userData = currentDataStore.find(
          (data) => data?.user?.id === payload.new.user_id,
        )?.user;

        if (!userData) {
          try {
            userData = await getUserById(payload.new.user_id);
          } catch (err) {
            console.error('Error fetching user:', err);
            throw err;
          }
        }

        return {
          ...payload.new,
          user: userData,
        };
      }

      return payload.new;
    },
    [],
  );

  // Handle subscription updates
  const handleSubscription = useCallback(
    async <T extends ChatMessages.Type | Chats.Type | ChatMembers.Type>(
      payload: SubscriptionPayload,
      currentDataStore: T | T[],
      stateSetter: React.Dispatch<React.SetStateAction<T | T[]>>,
      tableName: TableName,
    ) => {
      try {
        const newData = (await reconcileData(
          payload,
          currentDataStore,
          tableName,
        )) as T;

        stateSetter((prevState) => {
          if (Array.isArray(prevState)) {
            if (tableName === TableName.CHAT_MESSAGES) {
              return reconcileMessages(
                prevState as ChatMessages.Type[],
                newData as ChatMessages.Type,
              ) as T[];
            }
            return [...prevState, newData] as T[];
          }
          return newData;
        });
      } catch (error) {
        console.error('Error handling subscription:', error);
      }
    },
    [reconcileData],
  );

  // Initialize subscriptions when there's an active chat
  // useEffect(() => {
  //   if (activeChatData) {
  //     useChatSubscriptions(
  //       activeChatData.id,
  //       handleSubscription,
  //       activeChatData,
  //       setActiveChatData,
  //       messages,
  //       setMessages,
  //       members,
  //       setMembers,
  //     );
  //   }
  // }, [activeChatData, handleSubscription, messages, members]);

  const value = {
    // Active chat management
    activeChat,
    setActiveChat,
    activeChatData,
    setActiveChatData,
    setMessages,
    // Messages management
    messages: messages.filter((msg) => !('deleted_at' in msg)),
    members,

    addMessage: async ({
      content,
      fileIds,
      userId,
    }: {
      content: string;
      fileIds: string[];
      userId: string;
    }) => {
      await addMessageMutation.mutateAsync({ content, fileIds, userId });
    },

    deleteMessage: async (messageId: string) => {
      await deleteMessageMutation.mutateAsync(messageId);
    },
    isLoading,
    handleMembersUpdateMutation,
    handleUpdate,
    handleDeleteMutation,
    handleSendMessage,
    handleUpdateMutation,
    chatById,
    chats: chatsQuery,
    createChatMutation,
    addMessageMutation,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
