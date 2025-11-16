import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Check } from 'lucide-react';
// import { useTranslation } from 'react-i18next';

import { Spinner } from '@kit/ui/spinner';

import useInfiniteScroll from '~/hooks/use-infinite-scroll';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import {
  ChatInteractionType,
  combineChatInteractions,
  groupChatInteractionsByDay,
  sortChatInteractions,
} from '~/(main)/messages/utils/messages/transform';

import { useActivityContext } from '../context/activity-context';
import { DataSource } from '../context/activity.types';
import ActivityAction from './activity-actions';
import ScrollToBottomButton from './scroll-to-bottom-button';
import UserFirstMessage from './user-first-message';
import UserMessage from './user-message';
import UserReviewMessage from './user-review-message';

const Interactions = ({
  agencyStatuses,
}: {
  agencyStatuses: AgencyStatus.Type[];
}) => {
  const {
    messages,
    activities,
    reviews,
    interactionsQuery,
    userWorkspace,
    getUnreadCountForOrder,
    orderId,
    markOrderAsRead,
    unreadCounts,
    order
  } = useActivityContext();
  const briefResponses = order?.brief_responses;
  const orderOwner = order.client
  const interactionsContainerRef = useRef<HTMLDivElement>(null);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const groupedInteractions = useMemo(() => {
    const combinedInteractions = combineChatInteractions(
      messages,
      activities,
      reviews,
      !interactionsQuery.hasNextPage ? briefResponses : undefined,
    );
    const sortedInteractions = sortChatInteractions(combinedInteractions);
    return groupChatInteractionsByDay(sortedInteractions);
  }, [messages, activities, reviews, briefResponses, interactionsQuery.hasNextPage]);

  // const { t } = useTranslation('orders');

  const { loadMoreRef } = useInfiniteScroll({
    hasNextPage: interactionsQuery.hasNextPage,
    isFetchingNextPage: interactionsQuery.isFetchingNextPage,
    isFetching: interactionsQuery.isFetching,
    fetchNextPage: interactionsQuery.fetchNextPage,
    containerRef: interactionsContainerRef,
    anchorSelector: '[data-message-id]',
  });
  // Is the last message of the first page but is not self message
  const lastMessageForReadId =
    interactionsQuery.data?.pages[0]?.messages[
      interactionsQuery.data?.pages[0]?.messages.findLastIndex(
        (m) => m.user_id !== userWorkspace.id,
      ) ?? 0
    ]?.id ?? '';

  const lastMessageIsRead = unreadCounts.find((count) =>
    count?.message_ids?.includes(lastMessageForReadId),
  )?.message_ids.length ;

  const handleContainerScroll = () => {
    if (!interactionsContainerRef.current) return;
    const { scrollHeight, scrollTop, clientHeight } =
      interactionsContainerRef.current;
    const scrollPosition = scrollHeight - scrollTop - clientHeight;
    setShowScrollButton(scrollPosition > clientHeight);

    // Read messages when the user scrolls to the bottom, so it means is in the last message
    // And only if the message is not already read

    if (scrollPosition <= clientHeight && lastMessageIsRead) {
      void markOrderAsRead(orderId).catch((error) => {
        console.error('Failed to read messages', error);
      });
    }
  };

  const scrollToReadMessages = () => {
    if (!interactionsContainerRef.current) return;
    try {
      void markOrderAsRead(orderId);
      return interactionsContainerRef.current?.scrollTo({
        top: interactionsContainerRef.current.scrollHeight,
        behavior: 'auto',
      });
    } catch (error) {
      console.error('Failed to read messages', error);
    }
  };

  // Scroll to new messages when they are added
  const scrollToBottom = useCallback(
    (isFirstRender = false) => {
      // Only scroll if are new messages, not old ones
      // And for better UX, scroll only if the user is on the view of the new message or if the message is sent by the user
      if (!interactionsContainerRef.current) return;
      const { scrollHeight, scrollTop, clientHeight } =
        interactionsContainerRef.current;
      // First, calculate the scroll position from the bottom of the container
      const scrollPosition = scrollHeight - scrollTop - clientHeight;

      const lastMessage =
        interactionsQuery.data?.pages[0]?.messages[
          interactionsQuery.data?.pages[0]?.messages.length - 1
        ];
      const messageIsSentBySelf = lastMessage?.user_id === userWorkspace.id;
      const scrollIsInView = scrollPosition <= clientHeight;

      if (
        isFirstRender ||
        messageIsSentBySelf ||
        (interactionsQuery.data?.pages[0]?.messages.length && scrollIsInView)
      ) {
        interactionsContainerRef.current?.scrollTo({
          top: scrollHeight,
          behavior: 'auto',
        });
      }
    },
    [interactionsQuery.data?.pages, userWorkspace.id],
  );

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // Call scrollToBottom with isFirstRender=true on first render
  useEffect(() => {
    if (isFirstRender && !interactionsQuery.isLoading) {
      scrollToBottom(true);
      setIsFirstRender(false);
    }
  }, [isFirstRender, interactionsQuery.isLoading, scrollToBottom]);

  const unreadCount = getUnreadCountForOrder(orderId);

  return (
    <div
      className="relative box-border flex h-full max-h-full min-h-0 w-full min-w-0 shrink flex-grow flex-col gap-4 overflow-y-auto md:px-8 px-0"
      ref={interactionsContainerRef}
      onScroll={handleContainerScroll}
    >
      {interactionsQuery.isFetchingNextPage && (
        <Spinner className="mx-auto h-5 w-5 text-gray-500" />
      )}

      {/* Load more trigger placed at top with absolute positioning */}
      <div
        ref={loadMoreRef}
        className="absolute left-0 right-0 top-0 -z-10 h-20"
      />

      {interactionsQuery.isLoading ? (
        <Spinner className="mx-auto h-5 w-5" />
      ) : (
        Object.entries(groupedInteractions).map(([date, interactions]) => {
          return (
            <div key={date} className="relative flex flex-col gap-8">
              <div className="relative mt-2 flex w-full items-center justify-center rounded-md before:absolute before:left-0 before:top-1/2 before:h-[0.3px] before:w-full before:bg-gray-100">
                <h3 className="z-[10] whitespace-nowrap rounded-full border border-gray-300 bg-white p-1 px-2 pr-[1rem] text-sm font-semibold text-gray-700">
                  {date}
                </h3>
              </div>

              {interactions?.map((interaction) => {
                // Add data attribute to each message for scroll restoration
                const dataProps = {
                  'data-message-id': interaction.id,
                };

                return interaction.class ===
                  ChatInteractionType.BRIEF_RESPONSE ? (
                  <div
                    className="flex w-full p-2"
                    key={interaction.id}
                    {...dataProps}
                  >
                    <div className="mr-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-200 p-1">
                      <Check className="text-green-700 w-4 h-4" />
                    </div>
                    <UserFirstMessage interaction={interaction} user={{
                      ...orderOwner,
                      name: orderOwner.settings?.[0]?.name ?? orderOwner.name,
                      picture_url: orderOwner.settings?.[0]?.picture_url ?? orderOwner.picture_url
                    }}/>
                  </div>
                ) : interaction.class === ChatInteractionType.MESSAGE ? (
                  <UserMessage
                    message={interaction as DataSource.Message}
                    key={interaction.id}
                    {...dataProps}
                  />
                ) : interaction.class === ChatInteractionType.ACTIVITY ? (
                  <ActivityAction
                    activity={interaction as DataSource.Activity}
                    key={interaction.id}
                    agencyStatuses={agencyStatuses}
                    {...dataProps}
                  />
                ) : interaction.class === ChatInteractionType.REVIEW ? (
                  <UserReviewMessage
                    review={interaction as DataSource.Review}
                    key={interaction.id}
                    {...dataProps}
                  />
                ) : null;
              })}
            </div>
          );
        })
      )}
      {showScrollButton && (
        <ScrollToBottomButton
          // content={
          //   unreadCount > 0
          //     ? unreadCount === 1
          //       ? t('message.newMessages.singular')
          //       : t('message.newMessages.plural')
          //     : t('message.scrollToBottom')
          // }
          unreadMessages={unreadCount}
          onClick={scrollToReadMessages}
        />
      )}
    </div>
  );
};

export default Interactions;
