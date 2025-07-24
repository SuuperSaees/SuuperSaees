'use client';

import { ReactNode, createContext, useContext, useEffect } from 'react';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import { useUnreadMessageCounts } from '~/hooks/use-unread-message-counts';
import { File } from '~/lib/file.types';
import { InteractionResponse } from '~/server/actions/interactions/get-interactions';

import { useOrderApiActions } from '../hooks/use-order-api-actions';
import { useOrderState } from '../hooks/use-order-state';
import { useOrderSubscriptions } from '../hooks/use-order-subscriptions';
import { ActivityContextType, DataResult } from './activity.types';
import { useIsMobile } from '~/hooks/useIsMobile';

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
  initialInteractions?: InteractionResponse;
  initialFiles?: File.Response[];
  initialOrder: DataResult.Order;
  initialCursor: string;
  userRole: string;
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
  initialInteractions,
  initialOrder,
  initialFiles,
  initialCursor,
  userRole,
  clientOrganizationId,
  agencyId,
}: ActivityProviderProps) => {
  const isMobile = useIsMobile();
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
    allFiles,
    setAllFiles,
    fileUploads,
    handleFileUpload,
    handleRemoveFile,
  } = useOrderState({
    initialOrder,
    initialInteractions,
    initialFiles,
    initialCursor
  });

  // Get current user workspace information
  const { workspace: currentUser, organization } = useUserWorkspace();

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
    setAllFiles,
  );

  // Mark order as read when it changes
  const { markOrderAsRead, getUnreadCountForOrder, unreadCounts } =
    useUnreadMessageCounts({
      userId: currentUser.id ?? '',
      userRole: currentUser.role ?? '',
      userOrganizationId: organization?.id ?? '',
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
        briefResponses: order.brief_responses,
        userRole,
        addMessageMutation,
        userWorkspace: currentUser,
        deleteMessage: deleteMessageMutation,
        interactionsQuery,
        getUnreadCountForOrder,
        markOrderAsRead,
        orderId: order.id,
        unreadCounts,
        allFiles,
        fileUploads,
        handleFileUpload,
        handleRemoveFile,
        isMobile,
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
