'use client';

import { ReactNode, createContext, useContext, useEffect } from 'react';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import { useUnreadMessageCounts } from '~/hooks/use-unread-message-counts';
import { Activity } from '~/lib/activity.types';
import { Brief } from '~/lib/brief.types';
import { Message } from '~/lib/message.types';
import { Review } from '~/lib/review.types';

import { useOrderApiActions } from '../hooks/use-order-api-actions';
import { useOrderState } from '../hooks/use-order-state';
import { useOrderSubscriptions } from '../hooks/use-order-subscriptions';
import { ActivityContextType, DataResult } from './activity.types';

/**
 * Activity Context Provider
 *
 * This context manages the state and operations for order-related activities,
 * including messages, reviews, files, and order details. It provides real-time
 * updates through subscriptions and handles message operations.
 */

// Create the context with proper typing
export const ActivityContext = createContext<ActivityContextType | undefined>(
  undefined,
);

interface ActivityProviderProps {
  children: ReactNode;
  initialMessages?: Message.Response[];
  initialActivities?: Activity.Response[];
  initialReviews?: Review.Response[];
  initialOrder: DataResult.Order;
  userRole: string;
  briefResponses: Brief.Relationships.FormFieldResponse.Response[];
  clientOrganizationId: string;
  agencyId: string;
}

/**
 * ActivityProvider Component
 *
 * Provides a context for managing order activities, messages, reviews, and files.
 * Handles real-time updates and message operations.
 *
 * @param props - Component props containing initial data and configuration
 */
export const ActivityProvider = ({
  children,
  initialMessages,
  initialActivities,
  initialReviews,
  initialOrder,
  briefResponses: serverBriefResponses,
  userRole,
  clientOrganizationId,
  agencyId,
}: ActivityProviderProps) => {

  // Manage order state and related interactions
  const {
    order,
    setOrder,
    members,
    messages,
    activities,
    reviews,
    setInteractions,
    interactionsQuery,
    interactionsGroups,
  } = useOrderState({ initialOrder, initialMessages, initialActivities, initialReviews });

  // Get current user workspace information
  const { workspace: currentUser } = useUserWorkspace();

  // Initialize API actions for messages
  const { addMessageMutation, deleteMessageMutation } = useOrderApiActions({
    orderId: order.id,
    orderUUID: order.uuid,
    clientOrganizationId,
    agencyId,
    interactions: interactionsQuery.data,
    setInteractions: setInteractions,
  });

  // Set up real-time subscriptions for order updates
  useOrderSubscriptions(
    order,
    setOrder,
    interactionsGroups,
    setInteractions,
    interactionsGroups,
    setInteractions,
    interactionsGroups,
    setInteractions,
    interactionsGroups,
    setInteractions,
    members,
  );

  // Mark order as read when it changes
  const { markOrderAsRead, getUnreadCountForOrder, unreadCounts } = useUnreadMessageCounts({
    userId: currentUser.id ?? '',
  });

  useEffect(() => {
    if (order.id) {
      void markOrderAsRead(order.id);
    }
  }, [order.id, markOrderAsRead]);

  return (
    <ActivityContext.Provider
      value={{
        activities,
        messages: messages.filter((msg) => !msg.deleted_on),
        reviews,
        order,
        briefResponses: serverBriefResponses,
        userRole,
        addMessageMutation,
        userWorkspace: currentUser,
        deleteMessage: deleteMessageMutation,
        interactionsQuery,
        getUnreadCountForOrder,
        markOrderAsRead,
        orderId: order.id,
        unreadCounts,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

/**
 * Custom hook for accessing the activity context
 *
 * @throws Error if used outside of ActivityProvider
 * @returns The activity context value
 */
export const useActivityContext = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error(
      'useActivityContext must be used within a ActivityProvider',
    );
  }
  return context;
};
