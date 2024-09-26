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
  const { messages, files, activities, reviews } = useActivityContext();
  const interactionsContainerRef = useRef<HTMLDivElement>(null);

  // Combine all items into a single array
  const combinedInteractions = [
    ...messages.map((message) => ({ ...message, class: 'message' })),
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
      className="no-scrollbar mr-10 ml-2 flex h-full w-full min-w-0 shrink flex-col gap-4 overflow-y-auto border-t border-r-0 border-l-0 border-gray-200 border-b-0 p-0"
      ref={interactionsContainerRef}
    >
      {Object.entries(groupedInteractions).map(([date, interactions]) => (
        <div key={date} className="flex flex-col gap-8">
          <div className="relative flex w-full items-center justify-center rounded-md before:absolute before:left-0 before:top-1/2 before:h-[0.3px] before:w-full before:bg-gray-100">
            <h3 className="z-[10] rounded-full border border-gray-300 bg-white p-1 px-2 text-sm font-semibold text-gray-700">
              {date}
            </h3>
          </div>
          {interactions.map((interaction) => {
            return interaction.class === 'message' ? (
              <div className="flex w-full">
                <UserMessage
                  key={interaction.id}
                  message={interaction as Message}
                />
              </div>
            ) : interaction.class === 'activity' ? (
              <ActivityAction activity={interaction as Activity} />
            ) : interaction.class === 'review' ? (
              <UserReviewMessage
                review={interaction as Review}
                key={interaction.id}
              />
            ) : interaction.class === 'file' ? (
              <UserFile file={interaction as File} />
            ) : null;
          })}
        </div>
      ))}
    </div>
  );
};

export default Interactions;