'use client';

import { createContext, useContext, useCallback, ReactNode, useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChatMessages } from '~/lib/chat-messages.types';
import { Chats } from '~/lib/chats.types';
import { ChatMembers } from '~/lib/chat-members.types';
import { createMessage, deleteMessage } from '~/server/actions/chat-messages/chat-messages.action';
import { updateFile } from '~/team-accounts/src/server/actions/files/update/update-file';
import { generateUUID } from '~/utils/generate-uuid';
import { useChatSubscriptions } from '~/messages/hooks/use-chat-subscription';
import { SubscriptionPayload, TableName } from '~/lib/chats.types';
import { getUserById } from '~/team-accounts/src/server/actions/members/get/get-member-account';

interface ChatContextType {
  // Active chat management
  activeChat: string | null;
  setActiveChat: (chatId: string | null) => void;
  activeChatData: Chats.Type | null;
  setActiveChatData: (chat: Chats.Type | null) => void;
  
  // Messages management
  messages: ChatMessages.Type[];
  members: ChatMembers.Type[];
  addMessage: (params: { content: string; fileIds?: string[] }) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ 
  children,
  initialMessages = [],
  initialMembers = [],
  userId
}: { 
  children: ReactNode;
  initialMessages?: ChatMessages.Type[];
  initialMembers?: ChatMembers.Type[];
  userId: string;
}) {
  // Active chat state
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeChatData, setActiveChatData] = useState<Chats.Type | null>(null);
  
  // Messages and members state
  const [messages, setMessages] = useState<ChatMessages.Type[]>(initialMessages);
  const [members, setMembers] = useState<ChatMembers.Type[]>(initialMembers);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Reconcile messages helper
  const reconcileMessages = (currentMessages: ChatMessages.Type[], newMessage: ChatMessages.Type) => {
    if (!currentMessages.some(msg => msg.id === newMessage.id)) {
      const existingIndex = currentMessages.findIndex(msg => msg.temp_id === newMessage.temp_id);
      
      if (existingIndex !== -1) {
        return currentMessages.map((msg, index) => 
          index === existingIndex ? newMessage : msg
        );
      }
      return [...currentMessages, newMessage];
    }
    return currentMessages;
  };

  // Reconcile data with user information
  const reconcileData = useCallback(async (
    payload: SubscriptionPayload,
    currentDataStore: any,
    tableName: TableName
  ) => {
    if (Array.isArray(currentDataStore)) {
      let userData = currentDataStore.find(
        data => data?.user?.id === payload.new.user_id
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
  }, []);

  // Handle subscription updates
  const handleSubscription = useCallback(async <T extends ChatMessages.Type | Chats.Type | ChatMembers.Type>(
    payload: SubscriptionPayload,
    currentDataStore: T | T[],
    stateSetter: React.Dispatch<React.SetStateAction<T | T[]>>,
    tableName: TableName,
  ) => {
    try {
      const newData = await reconcileData(payload, currentDataStore, tableName) as T;
      
      stateSetter((prevState) => {
        if (Array.isArray(prevState)) {
          if (tableName === TableName.CHAT_MESSAGES) {
            return reconcileMessages(prevState as ChatMessages.Type[], newData as ChatMessages.Type) as T[];
          }
          return [...prevState, newData] as T[];
        }
        return newData;
      });
    } catch (error) {
      console.error('Error handling subscription:', error);
    }
  }, [reconcileData]);

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

  // Add message mutation
  const addMessageMutation = useMutation({
    mutationFn: async ({ content, fileIds }: { content: string; fileIds?: string[] }) => {
      if (!activeChatData) throw new Error('No active chat');
      
      const messageData = {
        content,
        chat_id: activeChatData.id,
        visibility: 'public',
      };

      const response = await createMessage(messageData);
      
      if (fileIds?.length) {
        await Promise.all(
          fileIds.map(fileId => updateFile(fileId, response.id))
        );
      }

      return response;
    },
    onMutate: async ({ content }) => {
      setIsLoading(true);
      const tempId = generateUUID();
      
      const optimisticMessage: ChatMessages.Type = {
        id: `temp-${tempId}`,
        content,
        chat_id: activeChatData?.id ?? '',
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        visibility: 'public',
        temp_id: tempId,
        pending: true,
        user: {
          id: userId,
          name: 'Current User', // You might want to pass user data through props
          email: '',
        }
      };

      setMessages(prev => [...prev, optimisticMessage]);
      return { optimisticMessage };
    },
    onError: (_, __, context) => {
      if (context?.optimisticMessage) {
        setMessages(prev => 
          prev.filter(msg => msg.temp_id !== context.optimisticMessage.temp_id)
        );
      }
      toast.error('Failed to send message');
    },
    onSuccess: () => {
      toast.success('Message sent successfully');
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: deleteMessage,
    onMutate: async (messageId) => {
      const previousMessages = messages;
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, deleted_at: new Date().toISOString() } 
            : msg
        )
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
    }
  });

  const value = {
    // Active chat management
    activeChat,
    setActiveChat,
    activeChatData,
    setActiveChatData,
    
    // Messages management
    messages: messages.filter(msg => !msg.deleted_at),
    members,
    addMessage: async ({ content, fileIds }) => {
      await addMessageMutation.mutateAsync({ content, fileIds });
    },
    deleteMessage: async (messageId: string) => {
      await deleteMessageMutation.mutateAsync(messageId);
    },
    isLoading
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}