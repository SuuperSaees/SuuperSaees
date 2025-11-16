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
import { Review } from '~/lib/review.types';

type UpdaterFunction = (
  updater:
    | DataResult.InteractionPages
    | ((prev: DataResult.InteractionPages) => DataResult.InteractionPages),
) => void;

type IndexResult = {
  pageIndex: number;
  itemIndex: number;
};

type InteractionItem =
  | DataResult.Message
  | DataResult.Activity
  | DataResult.Review;

/**
 * Helper function to enrich data with user information
 */
const enrichWithUser = async (
  data: Message.Type | Activity.Type | File.Type | Review.Type,
  existingItems:
    | DataResult.Message[]
    | DataResult.Activity[]
    | DataResult.File[]
    | DataResult.Review[],
  members?: UserExtended[],
): Promise<DataResult.Message | DataResult.Activity | DataResult.File | DataResult.Review> => {
  // Try to find existing user data or fetch from API
  let user =
    members?.find((member) => member.id === data.user_id) ??
    existingItems?.find((item) => item.user_id === data.user_id)?.user;

  if (!user) {
    try {
      // Ensure the user fetched from API is compatible with UserExtended
      const fetchedUser = await getUserById(data.user_id);
      user = {
        id: fetchedUser.id,
        name: fetchedUser.name,
        email: fetchedUser.email,
        picture_url: fetchedUser.picture_url,
      };
    } catch (err) {
      console.error('Error fetching user:', err);
      throw err;
    }
  }

  return { ...data, user } as
    | DataResult.Message
    | DataResult.Activity
    | DataResult.File;
};

/**
 * Find the page and item indexes in interactions data
 */
const findIndexes = (
  interactions: DataResult.InteractionPages,
  findPredicate: (item: InteractionItem) => boolean,
  collection: 'messages' | 'activities' | 'reviews',
): IndexResult => {
  if (!interactions) {
    return { pageIndex: -1, itemIndex: -1 };
  }

  for (let pageIndex = 0; pageIndex < interactions.pages.length; pageIndex++) {
    const page = interactions.pages[pageIndex];
    if (!page) continue;

    const items = page[collection] || [];
    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const item = items[itemIndex];
      if (item && findPredicate(item)) {
        return { pageIndex, itemIndex };
      }
    }
  }

  return { pageIndex: -1, itemIndex: -1 };
};

// Helper function to update pages array
const updateInteractionPage = (
  prevInteractions: DataResult.InteractionPages,
  pageIndex: number,
  updatedData: Partial<{
    messages: DataResult.Message[];
    activities: DataResult.Activity[];
    reviews: DataResult.Review[];
  }>,
): DataResult.InteractionPages => {
  if (!prevInteractions) {
    return {
      pages: [
        {
          messages: updatedData.messages ?? [],
          activities: updatedData.activities ?? [],
          reviews: updatedData.reviews ?? [],
          nextCursor: null,
        }
      ],
      pageParams: [],
    };
  }

  const newPages = [...prevInteractions.pages];
  newPages[pageIndex] = {
    ...newPages[pageIndex],
    messages: updatedData.messages ?? newPages[pageIndex]?.messages ?? [],
    activities: updatedData.activities ?? newPages[pageIndex]?.activities ?? [],
    reviews: updatedData.reviews ?? newPages[pageIndex]?.reviews ?? [],
    nextCursor: newPages[pageIndex]?.nextCursor ?? null,
  };

  return {
    pages: newPages,
    pageParams: prevInteractions.pageParams ?? [],
  };
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
    if (payload.eventType === 'UPDATE') {
      const updatedOrder =
        updateArrayData([order], payload.new, 'id', false)[0] ?? order;
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
    interactions: DataResult.InteractionPages,
    setInteractions: UpdaterFunction,
    members?: UserExtended[],
  ): Promise<void | boolean> => {
    const { eventType, new: newData } = payload;

    if (eventType === 'INSERT') {
      try {
        const enrichedMessage = {
          ...(await enrichWithUser(
            newData,
            interactions?.pages[0]?.messages ?? [],
            members,
          )),
          pending: false,
        } as DataResult.Message;
        
        const updatedMessages = updateArrayData(
          interactions?.pages[0]?.messages ?? [],
          enrichedMessage,
          'temp_id',
          true,
        );

        setInteractions((prevInteractions) =>
          updateInteractionPage(prevInteractions, 0, {
            messages: updatedMessages,
          }),
        );
        return true;
      } catch (err) {
        return false;
      }
    } else if (eventType === 'UPDATE') {
      const { new: newMessage } = payload;

      // Find message to update across all pages
      const { pageIndex, itemIndex: messageIndex } = findIndexes(
        interactions,
        (message) => message.id === newMessage.id,
        'messages',
      );

      if (messageIndex === -1 || pageIndex === -1) return false;

      const updatedMessages = updateArrayData(
        interactions?.pages[pageIndex]?.messages ?? [],
        newMessage as DataResult.Message,
        'temp_id',
        false,
      );

      const messageToUpdate = updatedMessages[messageIndex];
      if (!messageToUpdate) return false;

      if (newMessage.deleted_on) {
        messageToUpdate.deleted_on = newMessage.deleted_on;
      }

      setInteractions((prevInteractions) =>
        updateInteractionPage(prevInteractions, pageIndex, {
          messages: updatedMessages,
        }),
      );

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
    setInteractions: UpdaterFunction,
    setAllFiles?: React.Dispatch<React.SetStateAction<DataResult.File[]>>,
  ): void | boolean => {
    const { eventType, new: newData } = payload;

    if (eventType === 'INSERT') {
      setInteractions((prevInteractions) => {
        // Find the message this file belongs to
        const { pageIndex, itemIndex: messageIndex } = findIndexes(
          prevInteractions,
          (message) => message.id === newData.message_id,
          'messages',
        );

        if (pageIndex === -1 || messageIndex === -1) return prevInteractions;

        const messageToUpdate =
          prevInteractions?.pages[pageIndex]?.messages[messageIndex];

        if (!messageToUpdate) return prevInteractions;

        // Update the message with new file
        const updatedMessage = {
          ...messageToUpdate,
          files: updateArrayData(
            messageToUpdate?.files ?? [],
            { ...newData, isLoading: false },
            'temp_id',
            true,
          ),
        };

        // Update messages array with the updated message
        const updatedMessages = updateArrayData(
          prevInteractions?.pages[pageIndex]?.messages ?? [],
          updatedMessage,
          'id',
          false,
        );

        return updateInteractionPage(prevInteractions, pageIndex, {
          messages: updatedMessages,
        });
      });

      // Insert allFiles local array so it can be used for the annotations context with requires the ids of the files
      if (setAllFiles) {
        setAllFiles((prevAllFiles) => [...prevAllFiles, newData]);
      }

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
    activities: DataResult.InteractionPages,
    setActivities: UpdaterFunction,
    members?: UserExtended[],
  ): Promise<void | boolean> => {
    const { eventType, new: newData } = payload;

    if (eventType === 'INSERT') {
      try {
        // Create enriched activity with user data
        const enrichedActivity = (await enrichWithUser(
          newData,
          activities?.pages[0]?.activities ?? [],
          members,
        )) as DataResult.Activity;

        const updatedActivities = updateArrayData(
          activities?.pages[0]?.activities ?? [],
          enrichedActivity,
          'id',
          true,
        );

        setActivities((prevInteractions) =>
          updateInteractionPage(prevInteractions, 0, {
            activities: updatedActivities,
          }),
        );
        return true;
      } catch (err) {
        return false;
      }
    }

    return false;
  };

  /**
   * Handles new review events from Supabase Realtime
   * Enrich reviews with user
   */
  const handleReviewChanges = async (
    payload: RealtimePostgresChangesPayload<Review.Type>,
    reviews: DataResult.InteractionPages,
    setReviews: UpdaterFunction,
    members?: UserExtended[],
  ) => {
    const { eventType, new: newData } = payload;

    if (eventType === 'INSERT') {
      try {
        const enrichedReview = (await enrichWithUser(
          newData,
          reviews?.pages[0]?.reviews ?? [],
          members,
        )) as DataResult.Review;

        const updatedReviews = updateArrayData(
          reviews?.pages[0]?.reviews ?? [],
          enrichedReview,
          'id',
          true,
      );

      setReviews((prevInteractions) =>
        updateInteractionPage(prevInteractions, 0, {
          reviews: updatedReviews,
        }),
      );
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
    handleReviewChanges,
  };
};
