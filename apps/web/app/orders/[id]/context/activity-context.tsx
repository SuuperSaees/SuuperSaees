'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import { useUnreadMessageCounts } from '~/hooks/use-unread-message-counts';
import { Activity } from '~/lib/activity.types';
import { Brief } from '~/lib/brief.types';
import { Message } from '~/lib/message.types';
import { Review } from '~/lib/review.types';
import {
  InteractionResponse,
  getInteractions,
} from '~/server/actions/interactions/get-interactions';

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
  activities: Activity.Response[];
  messages?: Message.Response[];
  reviews: Review.Response[];
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
  // activities: serverActivities,
  // messages: serverMessages,
  // reviews: serverReviews,
  order: serverOrder,
  briefResponses: serverBriefResponses,
  userRole,
  clientOrganizationId,
  agencyId,
}: ActivityProviderProps) => {
  // State management for various data types
  const [order, setOrder] = useState<DataResult.Order>(serverOrder);
  // const [messages, setMessages] =
  //   useState<DataResult.Message[]>(serverMessages);
  // const [activities, setActivities] =
  //   useState<DataResult.Activity[]>(serverActivities);
  // const [reviews, setReviews] = useState<DataResult.Review[]>(serverReviews);
  const [files, setFiles] = useState<DataResult.File[]>([]);

  const members = [
    ...order.assigned_to.map((member) => member.agency_member),
    ...order.followers.map((member) => member.client_follower),
  ];

  const queryClient = useQueryClient();
  const interactionsQuery = useInfiniteQuery({
    queryKey: ['interactions', order.id],
    initialPageParam: new Date().toISOString(), // works because descending
    queryFn: async ({ pageParam }) =>
      await getInteractions(order.id, {
        pagination: {
          cursor: pageParam, // strict less than this
          limit: 10,
        },
      }),
    getNextPageParam: (lastPage) => {
      // get last message from the *last page* (remember, descending order)
      const mergedInteractions = [
        ...lastPage.messages,
        ...lastPage.activities,
        ...lastPage.reviews,
      ];
      const orderedInteractions = mergedInteractions.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      const lastInteraction =
        orderedInteractions[orderedInteractions.length - 1];
      const lastInteractionDate = lastInteraction?.created_at ?? undefined;
      return lastInteractionDate; // this becomes the new cursor
    },
  });

  console.log('interactionsQuery', interactionsQuery.data);
  const interactionsGroups: InfiniteData<InteractionResponse, unknown> =
    interactionsQuery.data ?? {
      pages: [],
      pageParams: [],
    };
  const messages = interactionsGroups.pages
    .flatMap((page) => page.messages)
    .filter((message) =>
      !['agency_owner', 'agency_member', 'agency_project_manager'].includes(
        userRole,
      )
        ? message?.visibility !== 'internal_agency'
        : true,
    );

  const activities = interactionsGroups.pages.flatMap(
    (page) => page.activities,
  );
  const reviews = interactionsGroups.pages.flatMap((page) => page.reviews);
  /**
   * Updates messages in the React Query cache while preserving other chat data
   *
   * @param updater - New messages array or update function
   */
  const messagesQueryKey = useMemo(() => ['interactions', order.id], [order.id]);
  const setInteractions = useCallback(
    (
      updater:
        | DataResult.InteractionPages
        | ((prev: DataResult.InteractionPages) => DataResult.InteractionPages),
    ) => {
      queryClient.setQueryData<DataResult.InteractionPages>(
        messagesQueryKey,
        (oldData) => {
          if (!oldData) return oldData;
          const currentInteractions = oldData ?? { pages: [], pageParams: [] };
          const newInteractions =
            typeof updater === 'function' ? updater(currentInteractions) : updater;
          return newInteractions;
        },
      );
    },
    [queryClient, messagesQueryKey],
  );




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
    files,
    setFiles,
    members,
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
        interactionsQuery,
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
