'use client';

import { useEffect, useRef } from 'react';



import { Activity, File, Message, Review, useActivityContext } from '../context/activity-context';
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
      className="no-scrollbar flex max-h-full shrink w-full flex-col
       gap-8 overflow-y-auto rounded-lg border border-gray-200 p-4"
      ref={interactionsContainerRef}
    >
      {sortedInteractions.map((interaction) => {
        return interaction.class === 'message' ? (
          <UserMessage key={interaction.id} message={interaction as Message} />
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
  );
};
export default Interactions;