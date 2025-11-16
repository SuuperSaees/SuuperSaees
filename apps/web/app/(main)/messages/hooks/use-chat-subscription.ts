import { useEffect } from 'react';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { ChatMessages } from '~/lib/chat-messages.types';
import { Chats } from '~/lib/chats.types';
import { ChatMembers } from '~/lib/chat-members.types';
import { SubscriptionPayload, TableName } from '~/lib/chats.types';

export const useChatSubscriptions = (
  chatId: string,
  handleSubscription: <T extends ChatMessages.Type | Chats.Type | ChatMembers.Type>(
    payload: SubscriptionPayload,
    currentDataStore: T | T[],
    stateSetter: React.Dispatch<React.SetStateAction<T | T[]>>,
    tableName: TableName,
  ) => Promise<void>,
  chat: Chats.Type,
  setChat: React.Dispatch<React.SetStateAction<Chats.Type>>,
  messages: ChatMessages.Type[],
  setMessages: React.Dispatch<React.SetStateAction<ChatMessages.Type[]>>,
  members: ChatMembers.Type[],
  setMembers: React.Dispatch<React.SetStateAction<ChatMembers.Type[]>>,
) => {
  const supabase = useSupabase();

  useEffect(() => {
    const channel = supabase
      .channel('chat-changes')
      // Listen for chat messages changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          if (payload.table === 'chat_messages') {
            void handleSubscription<ChatMessages.Type>(
              payload.new as SubscriptionPayload,
              messages,
              setMessages as React.Dispatch<
                React.SetStateAction<ChatMessages.Type | ChatMessages.Type[]>
              >,
              TableName.CHAT_MESSAGES,
            );
          }
        },

      )
      // Listen for chat members changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_members',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          if (payload.table === 'chat_members') {
            void handleSubscription<ChatMembers.Type>(
              payload.new as SubscriptionPayload,
              members,
              setMembers as React.Dispatch<
                React.SetStateAction<ChatMembers.Type | ChatMembers.Type[]>
              >,
              TableName.CHAT_MEMBERS,
            );
          }
        },

      )
      // Listen for chat changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
          filter: `id=eq.${chatId}`,
        },
        (payload) => {
          if (payload.table === 'chats') {
            void handleSubscription<Chats.Type>(
              payload.new as SubscriptionPayload,
              chat,
              setChat as React.Dispatch<React.SetStateAction<Chats.Type | Chats.Type[]>>,
              TableName.CHATS,
            );
          }
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [
    supabase,
    chatId,
    handleSubscription,
    chat,
    setChat,
    messages,
    setMessages,
    members,
    setMembers,
  ]);
};