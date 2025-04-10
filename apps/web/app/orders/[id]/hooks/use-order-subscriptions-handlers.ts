import type React from 'react';

import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

import type { File } from '~/lib/file.types';
import type { Message } from '~/lib/message.types';
import type { Order } from '~/lib/order.types';
import { getUserById } from '~/team-accounts/src/server/actions/members/get/get-member-account';
import { updateArrayData } from '~/utils/data-transform';

import type { DataResult } from '../context/activity.types';

/**
 * Custom hook for handling Supabase Realtime subscription events for orders, messages, and files
 */
export const useOrderSubscriptionsHandlers = () => {
  /**
   * Handles order update events from Supabase Realtime
   */
  const handleOrderChanges = (
    payload: RealtimePostgresChangesPayload<Order.Type>,
    order: DataResult.Order,
    setOrder: React.Dispatch<React.SetStateAction<DataResult.Order>>,
  ): boolean => {
    const { eventType, new: newData, table } = payload;

    if (table !== 'orders_v2' || eventType !== 'UPDATE') {
      return false;
    }

    const updatedOrder =
      updateArrayData([order], newData, 'id', false)[0] ?? order;
    setOrder(updatedOrder);
    return true;
  };

  /**
   * Handles new message events from Supabase Realtime
   * Enriches messages with user data
   */
  const handleMessageChanges = async (
    payload: RealtimePostgresChangesPayload<Message.Type>,
    messages: DataResult.Message[],
    setMessages: React.Dispatch<React.SetStateAction<DataResult.Message[]>>,
  ): Promise<boolean> => {
    const { eventType, new: newData, table } = payload;

    if (table !== 'messages' || eventType !== 'INSERT') {
      return false;
    }

    const message = newData as DataResult.Message;

    // Try to find existing user data or fetch from API
    let user = messages.find((msg) => msg.id === message.id)?.user;
    if (!user) {
      try {
        user = await getUserById(message.user_id);
      } catch (err) {
        console.error('Error fetching user:', err);
        return false;
      }
    }

    // Create enriched message with user data
    const enrichedMessage = {
      ...message,
      user,
      pending: false,
    };

    // Update messages array, matching by temp_id
    const updatedMessages = updateArrayData(
      messages,
      enrichedMessage,
      'temp_id',
      true,
    );

    setMessages(updatedMessages);
    return true;
  };

  /**
   * Handles new file events from Supabase Realtime
   * Associates files with their parent messages
   */
  const handleFileChanges = (
    payload: RealtimePostgresChangesPayload<File.Type>,
    setMessages: React.Dispatch<React.SetStateAction<DataResult.Message[]>>,
  ): boolean => {
    const { eventType, new: newData, table } = payload;

    if (table !== 'files' || eventType !== 'INSERT') {
      return false;
    }

    const file = newData;

    setMessages((prevMessages) => {
      // Find the message this file belongs to
      const messageIndex = prevMessages.findIndex(
        (msg) => msg.id === file.message_id,
      );
      if (messageIndex === -1) return prevMessages;

      // Create a copy of the messages array
      const updatedMessages = [...prevMessages];
      const message = updatedMessages[messageIndex];

      if (!message) return prevMessages;

      // Update the files array for this message
      const updatedFiles = updateArrayData(
        message?.files ?? [],
        { ...file, isLoading: false },
        'temp_id',
        true,
      );

      // Update the message with the new files array
      updatedMessages[messageIndex] = {
        ...message,
        files: updatedFiles,
      };

      return updatedMessages;
    });

    return true;
  };

  return { handleOrderChanges, handleMessageChanges, handleFileChanges };
};
