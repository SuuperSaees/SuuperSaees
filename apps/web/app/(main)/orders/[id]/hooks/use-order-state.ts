import { useCallback, useMemo, useState } from 'react';

import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import {
  InteractionResponse,
  getInteractions,
} from '~/server/actions/interactions/get-interactions';

import { DataResult } from '../context/activity.types';
import { useFileUploadActions } from '../../../../components/file-preview/hooks/use-file-upload-actions';

interface UseOrderStateProps {
  initialOrder: DataResult.Order;
  initialInteractions?: InteractionResponse;
  initialFiles?: DataResult.File[];
  initialCursor: string;
}

/**
 * Hook to manage order state and related interactions
 */
export const useOrderState = ({
  initialOrder,
  initialInteractions,
  initialFiles,
  initialCursor
}: UseOrderStateProps) => {
  // State management for various data types
  const { workspace: userWorkspace } = useUserWorkspace();
  const userRole = userWorkspace?.role ?? '';

  const [order, setOrder] = useState<DataResult.Order>(initialOrder);
  const [allFiles, setAllFiles] = useState<DataResult.File[]>(initialFiles ?? []);
  /**
   * Combined list of assigned members and followers
   */
  const members = [
    ...order.assigned_to.map((member) => member.agency_member),
    ...order.followers.map((member) => member.client_follower),
  ];

  const queryClient = useQueryClient();

  /**
   * Fetch paginated interactions for the current order
   */
  const interactionsQuery = useInfiniteQuery({
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryKey: ['interactions', order.id],
    initialData:
      initialInteractions
        ? {
            pages: [initialInteractions],
            pageParams: [initialCursor],
          }
        : undefined,
    initialPageParam: initialCursor, // Use consistent cursor from server
    queryFn: async ({ pageParam }) =>
      await getInteractions(order.id, {
        pagination: {
          cursor: pageParam, // strict less than this
          limit: 20,
        },
      }),
    getNextPageParam: (lastPage) => {

      return lastPage.nextCursor; // this becomes the new cursor
    },
  });
  /**
   * Memoized interaction data with fallback for empty state
   */
  const interactionsGroups: InfiniteData<InteractionResponse, unknown> =
    useMemo(
      () =>
        interactionsQuery.data ?? {
          pages: [],
          pageParams: [],
        },
      [interactionsQuery.data],
    );

  /**
   * Filtered messages based on user role and visibility
   */
  const messages = useMemo(
    () =>
      interactionsGroups.pages
        .flatMap((page) => page.messages)
        .filter((msg) => !msg.deleted_on)
        .filter((message) =>
          !['agency_owner', 'agency_member', 'agency_project_manager'].includes(
            userRole,
          )
            ? message?.visibility !== 'internal_agency'
            : true,
        ),
    [interactionsGroups, userRole],
  );

  const activities = interactionsGroups.pages.flatMap(
    (page) => page.activities,
  );
  const reviews = interactionsGroups.pages.flatMap((page) => page.reviews);
  // const briefResponses = interactionsGroups.pages.flatMap((page) => page.briefResponses);
  /**
   * Memoized query key for interactions data
   */
  const messagesQueryKey = useMemo(
    () => ['interactions', order.id],
    [order.id],
  );

  /**
   * Updates interactions in the React Query cache while preserving other data
   * @param updater - New interactions data or update function
   */
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
            typeof updater === 'function'
              ? updater(currentInteractions)
              : updater;
          return newInteractions;
        },
      );
    },
    [queryClient, messagesQueryKey],
  );


  const {
    fileUploads,
    handleFile: handleFileUpload,
    handleRemoveFile,
  } = useFileUploadActions({
    bucketName: 'orders',
    path: `uploads/${order.uuid}`,
  })

  // console.log('uploads', fileUploads);
  return {
    order,
    setOrder,
    members,
    messages,
    activities,
    reviews,
    // briefResponses,
    interactionsQuery,
    setInteractions,
    interactionsGroups,
    allFiles,
    setAllFiles,
    fileUploads,
    handleFileUpload,
    handleRemoveFile,
  };
};
