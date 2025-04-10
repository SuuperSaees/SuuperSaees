
'use client';

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import { useUnreadMessageCounts } from '~/hooks/use-unread-message-counts';
import { Brief } from '~/lib/brief.types';

import { useOrderApiActions } from '../hooks/use-order-api-actions';
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
  activities: DataResult.Activity[];
  messages: DataResult.Message[];
  reviews: DataResult.Review[];
  files: DataResult.File[];
  order: DataResult.Order;
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
  activities: serverActivities,
  messages: serverMessages,
  reviews: serverReviews,
  files: serverFiles,
  order: serverOrder,
  briefResponses: serverBriefResponses,
  userRole,
  clientOrganizationId,
  agencyId,
}: ActivityProviderProps) => {
  // State management for various data types
  const [order, setOrder] = useState<DataResult.Order>(serverOrder);
  const [messages, setMessages] =
    useState<DataResult.Message[]>(serverMessages);
  const [activities, setActivities] =
    useState<DataResult.Activity[]>(serverActivities);
  const [reviews, setReviews] = useState<DataResult.Review[]>(serverReviews);
  const [files, setFiles] = useState<DataResult.File[]>(serverFiles);

  // Get current user workspace information
  const { workspace: currentUser } = useUserWorkspace();

  // Initialize API actions for messages
  const { addMessageMutation, deleteMessageMutation } = useOrderApiActions({
    orderId: order.id,
    orderUUID: order.uuid,
    clientOrganizationId,
    agencyId,
    messages,
    setMessages,
  });

  // Set up real-time subscriptions for order updates
  useOrderSubscriptions(
    order,
    setOrder,
    activities,
    setActivities,
    messages,
    setMessages,
    reviews,
    setReviews,
    files,
    setFiles,
  );

  // Mark order as read when it changes
  const { markOrderAsRead } = useUnreadMessageCounts({
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
        files: files.filter((svFile) => !svFile.message_id),
        allFiles: files,
        order,
        briefResponses: serverBriefResponses,
        userRole,
        addMessageMutation,
        userWorkspace: currentUser,
        deleteMessage: deleteMessageMutation,
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
