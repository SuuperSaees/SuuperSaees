import { useMemo, useRef } from 'react';

import { Check } from 'lucide-react';


import { Spinner } from '@kit/ui/spinner';

import { Activity } from '~/lib/activity.types';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import { Review } from '~/lib/review.types';
import {
  combineChatInteractions,
  groupChatInteractionsByDay,
  sortChatInteractions,
} from '~/messages/utils/messages/transform';

import { useActivityContext } from '../context/activity-context';
import { DataSource } from '../context/activity.types';
import ActivityAction from './activity-actions';
import UserFirstMessage from './user-first-message';
import UserMessage from './user-message';
import UserReviewMessage from './user-review-message';
import useInfiniteScroll from '~/hooks/use-infinite-scroll';

const Interactions = ({
  agencyStatuses,
}: {
  agencyStatuses: AgencyStatus.Type[];
}) => {
  const { messages, activities, reviews, interactionsQuery } = useActivityContext();
  const interactionsContainerRef = useRef<HTMLDivElement>(null);


  const groupedInteractions = useMemo(() => {
    const combinedInteractions = combineChatInteractions(
      messages,
      activities as Activity.Type[],
      reviews as Review.Type[],
    );
    const sortedInteractions = sortChatInteractions(combinedInteractions);
    return groupChatInteractionsByDay(sortedInteractions);
  }, [messages, activities, reviews]);

 
  const { loadMoreRef } = useInfiniteScroll({
    hasNextPage: interactionsQuery.hasNextPage,
    isFetchingNextPage: interactionsQuery.isFetchingNextPage,
    isFetching: interactionsQuery.isFetching,
    fetchNextPage: interactionsQuery.fetchNextPage,
    containerRef: interactionsContainerRef,
    anchorSelector: '[data-message-id]',
  });

  console.log('MESSAGES', messages);
  return (
    <div
      className="relative box-border flex h-full max-h-full min-h-0 w-full min-w-0 shrink flex-grow flex-col gap-4 overflow-y-auto px-8"
      ref={interactionsContainerRef}
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

                return interaction.class === 'brief-field' ? (
                  <div
                    className="flex w-full"
                    key={interaction.id}
                    {...dataProps}
                  >
                    <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-green-200 p-1">
                      <Check className="text-green-700" />
                    </div>
                    <UserFirstMessage interaction={interaction} />
                  </div>
                ) : interaction.class === 'message' ? (
                  <UserMessage
                    message={interaction as DataSource.Message}
                    key={interaction.id}
                    {...dataProps}
                  />
                ) : interaction.class === 'activity' ? (
                  <ActivityAction
                    activity={interaction as DataSource.Activity}
                    key={interaction.id}
                    agencyStatuses={agencyStatuses}
                    {...dataProps}
                  />
                ) : interaction.class === 'review' ? (
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
    </div>
  );
};

export default Interactions;
