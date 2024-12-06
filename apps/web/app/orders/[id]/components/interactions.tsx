import { useEffect, useRef } from 'react';

import { format } from 'date-fns';

import {
  Activity,
  File,
  Message,
  Review,
  useActivityContext,
} from '../context/activity-context';
import ActivityAction from './activity-actions';
import UserFile from './user-file';
import UserMessage from './user-message';
import UserReviewMessage from './user-review-message';

const Interactions = () => {
  const { messages, files, activities, reviews, userRole } =
    useActivityContext();
  const interactionsContainerRef = useRef<HTMLDivElement>(null);

  // Combine all items into a single array with filtering based on user role

  const combinedInteractions = [
    ...messages
      .filter((message) =>
        !['agency_owner', 'agency_member', 'agency_project_manager'].includes(
          userRole,
        )
          ? message.visibility !== 'internal_agency'
          : true,
      )
      .map((message) => ({ ...message, class: 'message' })),
    ...files.map((file) => ({ ...file, class: 'file' })),
    ...activities.map((activity) => ({ ...activity, class: 'activity' })),
    ...reviews.map((review) => ({ ...review, class: 'review' })),
  ];

  // Sort combined interactions by date/time (oldest first)
  const sortedInteractions = combinedInteractions.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  // Group interactions by day
  const groupedInteractions = sortedInteractions.reduce(
    (groups, interaction) => {
      const date = format(new Date(interaction.created_at), 'MMMM d, yyyy');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(interaction);
      return groups;
    },
    {} as Record<string, typeof combinedInteractions>,
  );

  // Scroll to bottom / last item with smooth behaviour
  useEffect(() => {
    if (interactionsContainerRef.current) {
      interactionsContainerRef.current.scrollTo({
        top: interactionsContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [sortedInteractions]);

  return (
    <div
      className="no-scrollbar max-h-[calc(100vh-358px)] ml-2 mr-10 flex h-full w-full min-w-0 shrink flex-grow flex-col gap-4 overflow-y-auto p-0 pr-[2rem] px-8"
      ref={interactionsContainerRef}
    >
      {Object.entries(groupedInteractions).map(([date, interactions]) => (
        <div key={date} className="flex flex-col gap-8">
          <div className="relative mt-2 flex w-full items-center justify-center rounded-md before:absolute before:left-0 before:top-1/2 before:h-[0.3px] before:w-full before:bg-gray-100">
            <h3 className="z-[10] whitespace-nowrap rounded-full border border-gray-300 bg-white p-1 px-2 pr-[1rem] text-sm font-semibold text-gray-700">
              {date}
            </h3>
          </div>
          {interactions.map((interaction) => {
            return interaction.class === 'message' ? (
              <div className="flex w-full" key={interaction.id}>
                <UserMessage message={interaction as Message} />
              </div>
            ) : interaction.class === 'activity' ? (
              <ActivityAction
                activity={interaction as Activity}
                key={interaction.id}
              />
            ) : interaction.class === 'review' ? (
              <UserReviewMessage
                review={interaction as Review}
                key={interaction.id}
              />
            ) : interaction.class === 'file' ? (
              <UserFile file={interaction as File} key={interaction.id} />
            ) : null;
          })}
        </div>
      ))}
    </div>
  );
};

export default Interactions;
