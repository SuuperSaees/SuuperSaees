'use client';

import type React from 'react';

import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

import { Activity } from '~/lib/activity.types';
import type { File } from '~/lib/file.types';
import type { Message } from '~/lib/message.types';
import type { Order } from '~/lib/order.types';
import { getUserById } from '~/team-accounts/src/server/actions/members/get/get-member-account';
import { updateArrayData } from '~/utils/data-transform';

import type { DataResult, UserExtended } from '../context/activity.types';

/**
 * Helper function to enrich data with user information
 */
const enrichWithUser = async (
  data: Message.Type | Activity.Type | File.Type,
  existingItems:
    | DataResult.Message[]
    | DataResult.Activity[]
    | DataResult.File[],
  members?: UserExtended[],
): Promise<DataResult.Message | DataResult.Activity | DataResult.File> => {
  // Try to find existing user data or fetch from API
  // First check with members array, otherwise with existingItems array
  let user = null;
  if (members?.length) {
    user = members.find((member) => member.id === data.user_id);
  } else if (existingItems?.length) {
    user = existingItems.find((item) => item.user_id === data.user_id)?.user;
  }
  if (!user) {
    try {
      user = await getUserById(data.user_id);
    } catch (err) {
      console.error('Error fetching user:', err);
      throw err;
    }
  }

  return {
    ...data,
    user,
  } as DataResult.Message | DataResult.Activity | DataResult.File;
};

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
  ): void | boolean => {
    const { new: newData } = payload;

    if (payload.eventType === 'UPDATE') {
      const updatedOrder =
        updateArrayData([order], newData, 'id', false)[0] ?? order;
      setOrder(updatedOrder);
      return true;
    }
    return false;
  };

  /**
   * Handles new message events from Supabase Realtime
   * Enriches messages with user data
   */
  const handleMessageChanges = async (
    payload: RealtimePostgresChangesPayload<Message.Type>,
    messages: DataResult.Message[],
    setMessages: React.Dispatch<React.SetStateAction<DataResult.Message[]>>,
    members?: UserExtended[],
  ): Promise<void | boolean> => {
    const { eventType, new: newData } = payload;

    if (eventType === 'INSERT') {
      const message = newData;

      try {
        // Create enriched message with user data
        const enrichedMessage = {
          ...(await enrichWithUser(message, messages, members)),
          pending: false,
        } as DataResult.Message;

        // Update messages array, matching by temp_id
        const updatedMessages = updateArrayData(
          messages,
          enrichedMessage,
          'temp_id',
          true,
        );

        setMessages(updatedMessages);
        return true;
      } catch (err) {
        return false;
      }
    } else if (eventType === 'UPDATE') {
      const { new: newMessage } = payload;

      const messageIndex = messages.findIndex((msg) => msg.id === newData.id);
      if (messageIndex === -1) return false;
      const messagesToUpdate = [...messages];
      // Handle soft delete (use is_deleted_on)
      // Filter the message from messages array that has is_deleted_on
      const messageToUpdate = messagesToUpdate[messageIndex];
      if (!messageToUpdate) return false;

      if (newMessage.deleted_on) {
        messageToUpdate.deleted_on = newMessage.deleted_on;

        setMessages(messagesToUpdate);
      } else {
        // For normal cases, just update the messages
        const updatedMessages = updateArrayData(
          messages,
          newMessage as DataResult.Message,
          'temp_id',
          false,
        );
        setMessages(updatedMessages);
      }

      return true;
    }
    return false;
  };

  /**
   * Handles new file events from Supabase Realtime
   * Associates files with their parent messages
   */
  const handleFileChanges = (
    payload: RealtimePostgresChangesPayload<File.Type>,
    setMessages: React.Dispatch<React.SetStateAction<DataResult.Message[]>>,
  ): void | boolean => {
    const { eventType, new: newData } = payload;

    if (eventType === 'INSERT') {
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
    }
    return false;
  };

  /**
   * Handles new activity events from Supabase Realtime
   * Enrich activities with user
   */
  const handleActivityChanges = async (
    payload: RealtimePostgresChangesPayload<Activity.Type>,
    activities: DataResult.Activity[],
    setActivities: React.Dispatch<React.SetStateAction<DataResult.Activity[]>>,
    members?: UserExtended[],
  ): Promise<void | boolean> => {
    const { eventType, new: newData } = payload;

    if (eventType === 'INSERT') {
      const activity = newData;

      try {
        // Create enriched activity with user data
        const enrichedActivity = (await enrichWithUser(
          activity,
          activities,
          members,
        )) as DataResult.Activity;

        // Update activities array, matching by temp_id
        const updatedActivities = updateArrayData(
          activities,
          enrichedActivity,
          'id',
          true,
        );

        setActivities(updatedActivities);
        return true;
      } catch (err) {
        return false;
      }
    }

    return false;
  };

  return {
    handleOrderChanges,
    handleMessageChanges,
    handleFileChanges,
    handleActivityChanges,
  };
};
